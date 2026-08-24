package com.fogofwar.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.provider.OpenableColumns;
import androidx.activity.result.PickVisualMediaRequest;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.List;

/**
 * Multi-select video picker using the Android Photo Picker.
 * Gallery ACTION_PICK (used by capawesome FilePicker 5.x) often ignores
 * EXTRA_ALLOW_MULTIPLE on Samsung and other OEM galleries.
 */
@CapacitorPlugin(name = "VideoQueuePicker")
public class VideoQueuePickerPlugin extends Plugin {

    @PluginMethod
    public void pickVideos(PluginCall call) {
        try {
            startActivityForResult(call, createPickerIntent(), "onPickResult");
        } catch (Exception ex) {
            call.reject(ex.getMessage() != null ? ex.getMessage() : "pickVideos failed");
        }
    }

    private Intent createPickerIntent() {
        try {
            ActivityResultContracts.PickMultipleVisualMedia contract =
                new ActivityResultContracts.PickMultipleVisualMedia(maxSelectable());
            PickVisualMediaRequest request = new PickVisualMediaRequest.Builder()
                .setMediaType(ActivityResultContracts.PickVisualMedia.VideoOnly.INSTANCE)
                .build();
            Intent intent = contract.createIntent(getContext(), request);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            return intent;
        } catch (Exception ignored) {
            Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("video/*");
            intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            return intent;
        }
    }

    private int maxSelectable() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            try {
                return Math.max(2, MediaStore.getPickImagesMaxLimit());
            } catch (Exception ignored) {
                // fall through
            }
        }
        return 50;
    }

    @ActivityCallback
    private void onPickResult(PluginCall call, androidx.activity.result.ActivityResult result) {
        if (call == null) {
            return;
        }
        if (result.getResultCode() != Activity.RESULT_OK) {
            call.reject("pickFiles canceled.");
            return;
        }

        List<Uri> uris = extractUris(result.getData());
        JSArray files = new JSArray();
        ContentResolver resolver = getContext().getContentResolver();

        for (Uri uri : uris) {
            if (uri == null) {
                continue;
            }
            try {
                resolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } catch (Exception ignored) {
                // Photo Picker grants a temporary read permission instead.
            }

            JSObject file = new JSObject();
            file.put("path", uri.toString());
            file.put("name", displayName(uri));
            files.put(file);
        }

        JSObject ret = new JSObject();
        ret.put("files", files);
        call.resolve(ret);
    }

    private List<Uri> extractUris(@Nullable Intent data) {
        List<Uri> uris = new ArrayList<>();
        if (data == null) {
            return uris;
        }

        try {
            List<Uri> parsed = new ActivityResultContracts.PickMultipleVisualMedia()
                .parseResult(Activity.RESULT_OK, data);
            if (parsed != null && !parsed.isEmpty()) {
                return parsed;
            }
        } catch (Exception ignored) {
            // fall through to clip/data extras
        }

        if (data.getClipData() != null) {
            for (int i = 0; i < data.getClipData().getItemCount(); i++) {
                uris.add(data.getClipData().getItemAt(i).getUri());
            }
        } else if (data.getData() != null) {
            uris.add(data.getData());
        }
        return uris;
    }

    private String displayName(Uri uri) {
        String name = null;
        try (Cursor cursor = getContext().getContentResolver()
            .query(uri, new String[] { OpenableColumns.DISPLAY_NAME }, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (idx >= 0) {
                    name = cursor.getString(idx);
                }
            }
        } catch (Exception ignored) {
            // use last path segment below
        }
        if (name == null || name.isEmpty()) {
            name = uri.getLastPathSegment();
        }
        return name != null ? name : "video";
    }
}
