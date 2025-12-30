; ModuleID = 'marshal_methods.armeabi-v7a.ll'
source_filename = "marshal_methods.armeabi-v7a.ll"
target datalayout = "e-m:e-p:32:32-Fi8-i64:64-v128:64:128-a:0:32-n32-S64"
target triple = "armv7-unknown-linux-android21"

%struct.MarshalMethodName = type {
	i64, ; uint64_t id
	ptr ; char* name
}

%struct.MarshalMethodsManagedClass = type {
	i32, ; uint32_t token
	ptr ; MonoClass klass
}

@assembly_image_cache = dso_local local_unnamed_addr global [118 x ptr] zeroinitializer, align 4

; Each entry maps hash of an assembly name to an index into the `assembly_image_cache` array
@assembly_image_cache_hashes = dso_local local_unnamed_addr constant [236 x i32] [
	i32 42639949, ; 0: System.Threading.Thread => 0x28aa24d => 109
	i32 53857724, ; 1: ca/Microsoft.Maui.Controls.resources => 0x335cdbc => 1
	i32 72070932, ; 2: Microsoft.Maui.Graphics.dll => 0x44bb714 => 51
	i32 113429830, ; 3: zh-HK/Microsoft.Maui.Controls.resources => 0x6c2cd46 => 31
	i32 117431740, ; 4: System.Runtime.InteropServices => 0x6ffddbc => 104
	i32 165246403, ; 5: Xamarin.AndroidX.Collection.dll => 0x9d975c3 => 56
	i32 182336117, ; 6: Xamarin.AndroidX.SwipeRefreshLayout.dll => 0xade3a75 => 74
	i32 195452805, ; 7: vi/Microsoft.Maui.Controls.resources.dll => 0xba65f85 => 30
	i32 199333315, ; 8: zh-HK/Microsoft.Maui.Controls.resources.dll => 0xbe195c3 => 31
	i32 205061960, ; 9: System.ComponentModel => 0xc38ff48 => 87
	i32 280992041, ; 10: cs/Microsoft.Maui.Controls.resources.dll => 0x10bf9929 => 2
	i32 318968648, ; 11: Xamarin.AndroidX.Activity.dll => 0x13031348 => 52
	i32 336156722, ; 12: ja/Microsoft.Maui.Controls.resources.dll => 0x14095832 => 15
	i32 342366114, ; 13: Xamarin.AndroidX.Lifecycle.Common => 0x146817a2 => 63
	i32 356389973, ; 14: it/Microsoft.Maui.Controls.resources.dll => 0x153e1455 => 14
	i32 357576608, ; 15: cs/Microsoft.Maui.Controls.resources => 0x15502fa0 => 2
	i32 379916513, ; 16: System.Threading.Thread.dll => 0x16a510e1 => 109
	i32 385762202, ; 17: System.Memory.dll => 0x16fe439a => 95
	i32 395744057, ; 18: _Microsoft.Android.Resource.Designer => 0x17969339 => 34
	i32 435591531, ; 19: sv/Microsoft.Maui.Controls.resources.dll => 0x19f6996b => 26
	i32 442565967, ; 20: System.Collections => 0x1a61054f => 84
	i32 450948140, ; 21: Xamarin.AndroidX.Fragment.dll => 0x1ae0ec2c => 62
	i32 456227837, ; 22: System.Web.HttpUtility.dll => 0x1b317bfd => 111
	i32 469710990, ; 23: System.dll => 0x1bff388e => 113
	i32 498788369, ; 24: System.ObjectModel => 0x1dbae811 => 101
	i32 500358224, ; 25: id/Microsoft.Maui.Controls.resources.dll => 0x1dd2dc50 => 13
	i32 503918385, ; 26: fi/Microsoft.Maui.Controls.resources.dll => 0x1e092f31 => 7
	i32 513247710, ; 27: Microsoft.Extensions.Primitives.dll => 0x1e9789de => 45
	i32 527168573, ; 28: hi/Microsoft.Maui.Controls.resources => 0x1f6bf43d => 10
	i32 539058512, ; 29: Microsoft.Extensions.Logging => 0x20216150 => 42
	i32 592146354, ; 30: pt-BR/Microsoft.Maui.Controls.resources.dll => 0x234b6fb2 => 21
	i32 597488923, ; 31: CommunityToolkit.Maui => 0x239cf51b => 35
	i32 627609679, ; 32: Xamarin.AndroidX.CustomView => 0x2568904f => 60
	i32 672442732, ; 33: System.Collections.Concurrent => 0x2814a96c => 81
	i32 688181140, ; 34: ca/Microsoft.Maui.Controls.resources.dll => 0x2904cf94 => 1
	i32 706645707, ; 35: ko/Microsoft.Maui.Controls.resources.dll => 0x2a1e8ecb => 16
	i32 709557578, ; 36: de/Microsoft.Maui.Controls.resources.dll => 0x2a4afd4a => 4
	i32 722857257, ; 37: System.Runtime.Loader.dll => 0x2b15ed29 => 105
	i32 759454413, ; 38: System.Net.Requests => 0x2d445acd => 99
	i32 775507847, ; 39: System.IO.Compression => 0x2e394f87 => 92
	i32 789151979, ; 40: Microsoft.Extensions.Options => 0x2f0980eb => 44
	i32 823281589, ; 41: System.Private.Uri.dll => 0x311247b5 => 102
	i32 830298997, ; 42: System.IO.Compression.Brotli => 0x317d5b75 => 91
	i32 870878177, ; 43: ar/Microsoft.Maui.Controls.resources => 0x33e88be1 => 0
	i32 904024072, ; 44: System.ComponentModel.Primitives.dll => 0x35e25008 => 85
	i32 926902833, ; 45: tr/Microsoft.Maui.Controls.resources.dll => 0x373f6a31 => 28
	i32 967690846, ; 46: Xamarin.AndroidX.Lifecycle.Common.dll => 0x39adca5e => 63
	i32 992768348, ; 47: System.Collections.dll => 0x3b2c715c => 84
	i32 993161700, ; 48: zh-Hans/Microsoft.Maui.Controls.resources => 0x3b3271e4 => 32
	i32 994346696, ; 49: FogOfWar.dll => 0x3b4486c8 => 80
	i32 994547685, ; 50: es/Microsoft.Maui.Controls.resources => 0x3b4797e5 => 6
	i32 1012816738, ; 51: Xamarin.AndroidX.SavedState.dll => 0x3c5e5b62 => 73
	i32 1028951442, ; 52: Microsoft.Extensions.DependencyInjection.Abstractions => 0x3d548d92 => 41
	i32 1029334545, ; 53: da/Microsoft.Maui.Controls.resources.dll => 0x3d5a6611 => 3
	i32 1035644815, ; 54: Xamarin.AndroidX.AppCompat => 0x3dbaaf8f => 53
	i32 1044663988, ; 55: System.Linq.Expressions.dll => 0x3e444eb4 => 93
	i32 1052210849, ; 56: Xamarin.AndroidX.Lifecycle.ViewModel.dll => 0x3eb776a1 => 65
	i32 1082857460, ; 57: System.ComponentModel.TypeConverter => 0x408b17f4 => 86
	i32 1084122840, ; 58: Xamarin.Kotlin.StdLib => 0x409e66d8 => 78
	i32 1098259244, ; 59: System => 0x41761b2c => 113
	i32 1178241025, ; 60: Xamarin.AndroidX.Navigation.Runtime.dll => 0x463a8801 => 70
	i32 1178797549, ; 61: fi/Microsoft.Maui.Controls.resources => 0x464305ed => 7
	i32 1203215381, ; 62: pl/Microsoft.Maui.Controls.resources.dll => 0x47b79c15 => 20
	i32 1214827643, ; 63: CommunityToolkit.Mvvm => 0x4868cc7b => 37
	i32 1234928153, ; 64: nb/Microsoft.Maui.Controls.resources.dll => 0x499b8219 => 18
	i32 1293217323, ; 65: Xamarin.AndroidX.DrawerLayout.dll => 0x4d14ee2b => 61
	i32 1324164729, ; 66: System.Linq => 0x4eed2679 => 94
	i32 1376866003, ; 67: Xamarin.AndroidX.SavedState => 0x52114ed3 => 73
	i32 1406073936, ; 68: Xamarin.AndroidX.CoordinatorLayout => 0x53cefc50 => 57
	i32 1461234159, ; 69: System.Collections.Immutable.dll => 0x5718a9ef => 82
	i32 1462112819, ; 70: System.IO.Compression.dll => 0x57261233 => 92
	i32 1469204771, ; 71: Xamarin.AndroidX.AppCompat.AppCompatResources => 0x57924923 => 54
	i32 1470490898, ; 72: Microsoft.Extensions.Primitives => 0x57a5e912 => 45
	i32 1479771757, ; 73: System.Collections.Immutable => 0x5833866d => 82
	i32 1480492111, ; 74: System.IO.Compression.Brotli.dll => 0x583e844f => 91
	i32 1493001747, ; 75: hi/Microsoft.Maui.Controls.resources.dll => 0x58fd6613 => 10
	i32 1514721132, ; 76: el/Microsoft.Maui.Controls.resources.dll => 0x5a48cf6c => 5
	i32 1543031311, ; 77: System.Text.RegularExpressions.dll => 0x5bf8ca0f => 108
	i32 1551623176, ; 78: sk/Microsoft.Maui.Controls.resources.dll => 0x5c7be408 => 25
	i32 1554762148, ; 79: fr/Microsoft.Maui.Controls.resources => 0x5cabc9a4 => 8
	i32 1580413037, ; 80: sv/Microsoft.Maui.Controls.resources => 0x5e33306d => 26
	i32 1591080825, ; 81: zh-Hant/Microsoft.Maui.Controls.resources => 0x5ed5f779 => 33
	i32 1622152042, ; 82: Xamarin.AndroidX.Loader.dll => 0x60b0136a => 67
	i32 1624863272, ; 83: Xamarin.AndroidX.ViewPager2 => 0x60d97228 => 76
	i32 1634654947, ; 84: CommunityToolkit.Maui.Core.dll => 0x616edae3 => 36
	i32 1636350590, ; 85: Xamarin.AndroidX.CursorAdapter => 0x6188ba7e => 59
	i32 1639515021, ; 86: System.Net.Http.dll => 0x61b9038d => 96
	i32 1639986890, ; 87: System.Text.RegularExpressions => 0x61c036ca => 108
	i32 1657153582, ; 88: System.Runtime => 0x62c6282e => 106
	i32 1658251792, ; 89: Xamarin.Google.Android.Material.dll => 0x62d6ea10 => 77
	i32 1677501392, ; 90: System.Net.Primitives.dll => 0x63fca3d0 => 98
	i32 1679769178, ; 91: System.Security.Cryptography => 0x641f3e5a => 107
	i32 1729485958, ; 92: Xamarin.AndroidX.CardView.dll => 0x6715dc86 => 55
	i32 1736233607, ; 93: ro/Microsoft.Maui.Controls.resources.dll => 0x677cd287 => 23
	i32 1763938596, ; 94: System.Diagnostics.TraceSource.dll => 0x69239124 => 90
	i32 1766324549, ; 95: Xamarin.AndroidX.SwipeRefreshLayout => 0x6947f945 => 74
	i32 1770582343, ; 96: Microsoft.Extensions.Logging.dll => 0x6988f147 => 42
	i32 1780572499, ; 97: Mono.Android.Runtime.dll => 0x6a216153 => 116
	i32 1788241197, ; 98: Xamarin.AndroidX.Fragment => 0x6a96652d => 62
	i32 1808609942, ; 99: Xamarin.AndroidX.Loader => 0x6bcd3296 => 67
	i32 1809966115, ; 100: nb/Microsoft.Maui.Controls.resources => 0x6be1e423 => 18
	i32 1813058853, ; 101: Xamarin.Kotlin.StdLib.dll => 0x6c111525 => 78
	i32 1813201214, ; 102: Xamarin.Google.Android.Material => 0x6c13413e => 77
	i32 1818569960, ; 103: Xamarin.AndroidX.Navigation.UI.dll => 0x6c652ce8 => 71
	i32 1821794637, ; 104: hu/Microsoft.Maui.Controls.resources => 0x6c96614d => 12
	i32 1828688058, ; 105: Microsoft.Extensions.Logging.Abstractions.dll => 0x6cff90ba => 43
	i32 1842015223, ; 106: uk/Microsoft.Maui.Controls.resources.dll => 0x6dcaebf7 => 29
	i32 1858542181, ; 107: System.Linq.Expressions => 0x6ec71a65 => 93
	i32 1897975661, ; 108: FogOfWar => 0x7120cf6d => 80
	i32 1910275211, ; 109: System.Collections.NonGeneric.dll => 0x71dc7c8b => 83
	i32 1960264639, ; 110: ja/Microsoft.Maui.Controls.resources => 0x74d743bf => 15
	i32 1968388702, ; 111: Microsoft.Extensions.Configuration.dll => 0x75533a5e => 38
	i32 2014344398, ; 112: hr/Microsoft.Maui.Controls.resources => 0x781074ce => 11
	i32 2019465201, ; 113: Xamarin.AndroidX.Lifecycle.ViewModel => 0x785e97f1 => 65
	i32 2025202353, ; 114: ar/Microsoft.Maui.Controls.resources.dll => 0x78b622b1 => 0
	i32 2043674646, ; 115: it/Microsoft.Maui.Controls.resources => 0x79d00016 => 14
	i32 2045470958, ; 116: System.Private.Xml => 0x79eb68ee => 103
	i32 2055257422, ; 117: Xamarin.AndroidX.Lifecycle.LiveData.Core.dll => 0x7a80bd4e => 64
	i32 2070888862, ; 118: System.Diagnostics.TraceSource => 0x7b6f419e => 90
	i32 2079903147, ; 119: System.Runtime.dll => 0x7bf8cdab => 106
	i32 2090596640, ; 120: System.Numerics.Vectors => 0x7c9bf920 => 100
	i32 2127167465, ; 121: System.Console => 0x7ec9ffe9 => 88
	i32 2150663486, ; 122: ko/Microsoft.Maui.Controls.resources => 0x8030853e => 16
	i32 2159891885, ; 123: Microsoft.Maui => 0x80bd55ad => 49
	i32 2165051842, ; 124: ro/Microsoft.Maui.Controls.resources => 0x810c11c2 => 23
	i32 2181898931, ; 125: Microsoft.Extensions.Options.dll => 0x820d22b3 => 44
	i32 2192057212, ; 126: Microsoft.Extensions.Logging.Abstractions => 0x82a8237c => 43
	i32 2193016926, ; 127: System.ObjectModel.dll => 0x82b6c85e => 101
	i32 2201107256, ; 128: Xamarin.KotlinX.Coroutines.Core.Jvm.dll => 0x83323b38 => 79
	i32 2201231467, ; 129: System.Net.Http => 0x8334206b => 96
	i32 2266799131, ; 130: Microsoft.Extensions.Configuration.Abstractions => 0x871c9c1b => 39
	i32 2270573516, ; 131: fr/Microsoft.Maui.Controls.resources.dll => 0x875633cc => 8
	i32 2279755925, ; 132: Xamarin.AndroidX.RecyclerView.dll => 0x87e25095 => 72
	i32 2289298199, ; 133: th/Microsoft.Maui.Controls.resources => 0x8873eb17 => 27
	i32 2298471582, ; 134: System.Net.Mail => 0x88ffe49e => 97
	i32 2305521784, ; 135: System.Private.CoreLib.dll => 0x896b7878 => 114
	i32 2353062107, ; 136: System.Net.Primitives => 0x8c40e0db => 98
	i32 2368005991, ; 137: System.Xml.ReaderWriter.dll => 0x8d24e767 => 112
	i32 2369760409, ; 138: tr/Microsoft.Maui.Controls.resources => 0x8d3fac99 => 28
	i32 2371007202, ; 139: Microsoft.Extensions.Configuration => 0x8d52b2e2 => 38
	i32 2401565422, ; 140: System.Web.HttpUtility => 0x8f24faee => 111
	i32 2421992093, ; 141: nl/Microsoft.Maui.Controls.resources => 0x905caa9d => 19
	i32 2435356389, ; 142: System.Console.dll => 0x912896e5 => 88
	i32 2475788418, ; 143: Java.Interop.dll => 0x93918882 => 115
	i32 2480646305, ; 144: Microsoft.Maui.Controls => 0x93dba8a1 => 47
	i32 2520433370, ; 145: sk/Microsoft.Maui.Controls.resources => 0x963ac2da => 25
	i32 2605712449, ; 146: Xamarin.KotlinX.Coroutines.Core.Jvm => 0x9b500441 => 79
	i32 2617129537, ; 147: System.Private.Xml.dll => 0x9bfe3a41 => 103
	i32 2620871830, ; 148: Xamarin.AndroidX.CursorAdapter.dll => 0x9c375496 => 59
	i32 2663698177, ; 149: System.Runtime.Loader => 0x9ec4cf01 => 105
	i32 2732626843, ; 150: Xamarin.AndroidX.Activity => 0xa2e0939b => 52
	i32 2737747696, ; 151: Xamarin.AndroidX.AppCompat.AppCompatResources.dll => 0xa32eb6f0 => 54
	i32 2758225723, ; 152: Microsoft.Maui.Controls.Xaml => 0xa4672f3b => 48
	i32 2764765095, ; 153: Microsoft.Maui.dll => 0xa4caf7a7 => 49
	i32 2778768386, ; 154: Xamarin.AndroidX.ViewPager.dll => 0xa5a0a402 => 75
	i32 2801831435, ; 155: Microsoft.Maui.Graphics => 0xa7008e0b => 51
	i32 2802068195, ; 156: uk/Microsoft.Maui.Controls.resources => 0xa7042ae3 => 29
	i32 2806116107, ; 157: es/Microsoft.Maui.Controls.resources.dll => 0xa741ef0b => 6
	i32 2810250172, ; 158: Xamarin.AndroidX.CoordinatorLayout.dll => 0xa78103bc => 57
	i32 2831556043, ; 159: nl/Microsoft.Maui.Controls.resources.dll => 0xa8c61dcb => 19
	i32 2853208004, ; 160: Xamarin.AndroidX.ViewPager => 0xaa107fc4 => 75
	i32 2857259519, ; 161: el/Microsoft.Maui.Controls.resources => 0xaa4e51ff => 5
	i32 2861189240, ; 162: Microsoft.Maui.Essentials => 0xaa8a4878 => 50
	i32 2868488919, ; 163: CommunityToolkit.Maui.Core => 0xaaf9aad7 => 36
	i32 2883495834, ; 164: ru/Microsoft.Maui.Controls.resources => 0xabdea79a => 24
	i32 2909740682, ; 165: System.Private.CoreLib => 0xad6f1e8a => 114
	i32 2916838712, ; 166: Xamarin.AndroidX.ViewPager2.dll => 0xaddb6d38 => 76
	i32 2919462931, ; 167: System.Numerics.Vectors.dll => 0xae037813 => 100
	i32 2959614098, ; 168: System.ComponentModel.dll => 0xb0682092 => 87
	i32 2978675010, ; 169: Xamarin.AndroidX.DrawerLayout => 0xb18af942 => 61
	i32 3038032645, ; 170: _Microsoft.Android.Resource.Designer.dll => 0xb514b305 => 34
	i32 3057625584, ; 171: Xamarin.AndroidX.Navigation.Common => 0xb63fa9f0 => 68
	i32 3059408633, ; 172: Mono.Android.Runtime => 0xb65adef9 => 116
	i32 3059793426, ; 173: System.ComponentModel.Primitives => 0xb660be12 => 85
	i32 3077302341, ; 174: hu/Microsoft.Maui.Controls.resources.dll => 0xb76be845 => 12
	i32 3178803400, ; 175: Xamarin.AndroidX.Navigation.Fragment.dll => 0xbd78b0c8 => 69
	i32 3220365878, ; 176: System.Threading => 0xbff2e236 => 110
	i32 3258312781, ; 177: Xamarin.AndroidX.CardView => 0xc235e84d => 55
	i32 3316684772, ; 178: System.Net.Requests.dll => 0xc5b097e4 => 99
	i32 3317135071, ; 179: Xamarin.AndroidX.CustomView.dll => 0xc5b776df => 60
	i32 3346324047, ; 180: Xamarin.AndroidX.Navigation.Runtime => 0xc774da4f => 70
	i32 3362522851, ; 181: Xamarin.AndroidX.Core => 0xc86c06e3 => 58
	i32 3366347497, ; 182: Java.Interop => 0xc8a662e9 => 115
	i32 3374999561, ; 183: Xamarin.AndroidX.RecyclerView => 0xc92a6809 => 72
	i32 3428513518, ; 184: Microsoft.Extensions.DependencyInjection.dll => 0xcc5af6ee => 40
	i32 3452344032, ; 185: Microsoft.Maui.Controls.Compatibility.dll => 0xcdc696e0 => 46
	i32 3463511458, ; 186: hr/Microsoft.Maui.Controls.resources.dll => 0xce70fda2 => 11
	i32 3471940407, ; 187: System.ComponentModel.TypeConverter.dll => 0xcef19b37 => 86
	i32 3476120550, ; 188: Mono.Android => 0xcf3163e6 => 117
	i32 3479583265, ; 189: ru/Microsoft.Maui.Controls.resources.dll => 0xcf663a21 => 24
	i32 3542658132, ; 190: vi/Microsoft.Maui.Controls.resources => 0xd328ac54 => 30
	i32 3596930546, ; 191: de/Microsoft.Maui.Controls.resources => 0xd664cdf2 => 4
	i32 3608519521, ; 192: System.Linq.dll => 0xd715a361 => 94
	i32 3623444314, ; 193: da/Microsoft.Maui.Controls.resources => 0xd7f95f5a => 3
	i32 3641597786, ; 194: Xamarin.AndroidX.Lifecycle.LiveData.Core => 0xd90e5f5a => 64
	i32 3643854240, ; 195: Xamarin.AndroidX.Navigation.Fragment => 0xd930cda0 => 69
	i32 3647796983, ; 196: pt-BR/Microsoft.Maui.Controls.resources => 0xd96cf6f7 => 21
	i32 3657292374, ; 197: Microsoft.Extensions.Configuration.Abstractions.dll => 0xd9fdda56 => 39
	i32 3662115805, ; 198: he/Microsoft.Maui.Controls.resources => 0xda4773dd => 9
	i32 3672681054, ; 199: Mono.Android.dll => 0xdae8aa5e => 117
	i32 3686075795, ; 200: ms/Microsoft.Maui.Controls.resources => 0xdbb50d93 => 17
	i32 3697841164, ; 201: zh-Hant/Microsoft.Maui.Controls.resources.dll => 0xdc68940c => 33
	i32 3724971120, ; 202: Xamarin.AndroidX.Navigation.Common.dll => 0xde068c70 => 68
	i32 3748608112, ; 203: System.Diagnostics.DiagnosticSource => 0xdf6f3870 => 89
	i32 3786282454, ; 204: Xamarin.AndroidX.Collection => 0xe1ae15d6 => 56
	i32 3792276235, ; 205: System.Collections.NonGeneric => 0xe2098b0b => 83
	i32 3800979733, ; 206: Microsoft.Maui.Controls.Compatibility => 0xe28e5915 => 46
	i32 3817368567, ; 207: CommunityToolkit.Maui.dll => 0xe3886bf7 => 35
	i32 3823082795, ; 208: System.Security.Cryptography.dll => 0xe3df9d2b => 107
	i32 3841636137, ; 209: Microsoft.Extensions.DependencyInjection.Abstractions.dll => 0xe4fab729 => 41
	i32 3844307129, ; 210: System.Net.Mail.dll => 0xe52378b9 => 97
	i32 3849253459, ; 211: System.Runtime.InteropServices.dll => 0xe56ef253 => 104
	i32 3889960447, ; 212: zh-Hans/Microsoft.Maui.Controls.resources.dll => 0xe7dc15ff => 32
	i32 3896106733, ; 213: System.Collections.Concurrent.dll => 0xe839deed => 81
	i32 3896760992, ; 214: Xamarin.AndroidX.Core.dll => 0xe843daa0 => 58
	i32 3928044579, ; 215: System.Xml.ReaderWriter => 0xea213423 => 112
	i32 3931092270, ; 216: Xamarin.AndroidX.Navigation.UI => 0xea4fb52e => 71
	i32 3955647286, ; 217: Xamarin.AndroidX.AppCompat.dll => 0xebc66336 => 53
	i32 3980434154, ; 218: th/Microsoft.Maui.Controls.resources.dll => 0xed409aea => 27
	i32 3987592930, ; 219: he/Microsoft.Maui.Controls.resources.dll => 0xedadd6e2 => 9
	i32 4025784931, ; 220: System.Memory => 0xeff49a63 => 95
	i32 4046471985, ; 221: Microsoft.Maui.Controls.Xaml.dll => 0xf1304331 => 48
	i32 4070331268, ; 222: id/Microsoft.Maui.Controls.resources => 0xf29c5384 => 13
	i32 4073602200, ; 223: System.Threading.dll => 0xf2ce3c98 => 110
	i32 4094352644, ; 224: Microsoft.Maui.Essentials.dll => 0xf40add04 => 50
	i32 4100113165, ; 225: System.Private.Uri => 0xf462c30d => 102
	i32 4102112229, ; 226: pt/Microsoft.Maui.Controls.resources.dll => 0xf48143e5 => 22
	i32 4119206479, ; 227: pl/Microsoft.Maui.Controls.resources => 0xf5861a4f => 20
	i32 4125707920, ; 228: ms/Microsoft.Maui.Controls.resources.dll => 0xf5e94e90 => 17
	i32 4126470640, ; 229: Microsoft.Extensions.DependencyInjection => 0xf5f4f1f0 => 40
	i32 4182413190, ; 230: Xamarin.AndroidX.Lifecycle.ViewModelSavedState.dll => 0xf94a8f86 => 66
	i32 4213026141, ; 231: System.Diagnostics.DiagnosticSource.dll => 0xfb1dad5d => 89
	i32 4234116406, ; 232: pt/Microsoft.Maui.Controls.resources => 0xfc5f7d36 => 22
	i32 4271975918, ; 233: Microsoft.Maui.Controls.dll => 0xfea12dee => 47
	i32 4274623895, ; 234: CommunityToolkit.Mvvm.dll => 0xfec99597 => 37
	i32 4292120959 ; 235: Xamarin.AndroidX.Lifecycle.ViewModelSavedState => 0xffd4917f => 66
], align 4

@assembly_image_cache_indices = dso_local local_unnamed_addr constant [236 x i32] [
	i32 109, ; 0
	i32 1, ; 1
	i32 51, ; 2
	i32 31, ; 3
	i32 104, ; 4
	i32 56, ; 5
	i32 74, ; 6
	i32 30, ; 7
	i32 31, ; 8
	i32 87, ; 9
	i32 2, ; 10
	i32 52, ; 11
	i32 15, ; 12
	i32 63, ; 13
	i32 14, ; 14
	i32 2, ; 15
	i32 109, ; 16
	i32 95, ; 17
	i32 34, ; 18
	i32 26, ; 19
	i32 84, ; 20
	i32 62, ; 21
	i32 111, ; 22
	i32 113, ; 23
	i32 101, ; 24
	i32 13, ; 25
	i32 7, ; 26
	i32 45, ; 27
	i32 10, ; 28
	i32 42, ; 29
	i32 21, ; 30
	i32 35, ; 31
	i32 60, ; 32
	i32 81, ; 33
	i32 1, ; 34
	i32 16, ; 35
	i32 4, ; 36
	i32 105, ; 37
	i32 99, ; 38
	i32 92, ; 39
	i32 44, ; 40
	i32 102, ; 41
	i32 91, ; 42
	i32 0, ; 43
	i32 85, ; 44
	i32 28, ; 45
	i32 63, ; 46
	i32 84, ; 47
	i32 32, ; 48
	i32 80, ; 49
	i32 6, ; 50
	i32 73, ; 51
	i32 41, ; 52
	i32 3, ; 53
	i32 53, ; 54
	i32 93, ; 55
	i32 65, ; 56
	i32 86, ; 57
	i32 78, ; 58
	i32 113, ; 59
	i32 70, ; 60
	i32 7, ; 61
	i32 20, ; 62
	i32 37, ; 63
	i32 18, ; 64
	i32 61, ; 65
	i32 94, ; 66
	i32 73, ; 67
	i32 57, ; 68
	i32 82, ; 69
	i32 92, ; 70
	i32 54, ; 71
	i32 45, ; 72
	i32 82, ; 73
	i32 91, ; 74
	i32 10, ; 75
	i32 5, ; 76
	i32 108, ; 77
	i32 25, ; 78
	i32 8, ; 79
	i32 26, ; 80
	i32 33, ; 81
	i32 67, ; 82
	i32 76, ; 83
	i32 36, ; 84
	i32 59, ; 85
	i32 96, ; 86
	i32 108, ; 87
	i32 106, ; 88
	i32 77, ; 89
	i32 98, ; 90
	i32 107, ; 91
	i32 55, ; 92
	i32 23, ; 93
	i32 90, ; 94
	i32 74, ; 95
	i32 42, ; 96
	i32 116, ; 97
	i32 62, ; 98
	i32 67, ; 99
	i32 18, ; 100
	i32 78, ; 101
	i32 77, ; 102
	i32 71, ; 103
	i32 12, ; 104
	i32 43, ; 105
	i32 29, ; 106
	i32 93, ; 107
	i32 80, ; 108
	i32 83, ; 109
	i32 15, ; 110
	i32 38, ; 111
	i32 11, ; 112
	i32 65, ; 113
	i32 0, ; 114
	i32 14, ; 115
	i32 103, ; 116
	i32 64, ; 117
	i32 90, ; 118
	i32 106, ; 119
	i32 100, ; 120
	i32 88, ; 121
	i32 16, ; 122
	i32 49, ; 123
	i32 23, ; 124
	i32 44, ; 125
	i32 43, ; 126
	i32 101, ; 127
	i32 79, ; 128
	i32 96, ; 129
	i32 39, ; 130
	i32 8, ; 131
	i32 72, ; 132
	i32 27, ; 133
	i32 97, ; 134
	i32 114, ; 135
	i32 98, ; 136
	i32 112, ; 137
	i32 28, ; 138
	i32 38, ; 139
	i32 111, ; 140
	i32 19, ; 141
	i32 88, ; 142
	i32 115, ; 143
	i32 47, ; 144
	i32 25, ; 145
	i32 79, ; 146
	i32 103, ; 147
	i32 59, ; 148
	i32 105, ; 149
	i32 52, ; 150
	i32 54, ; 151
	i32 48, ; 152
	i32 49, ; 153
	i32 75, ; 154
	i32 51, ; 155
	i32 29, ; 156
	i32 6, ; 157
	i32 57, ; 158
	i32 19, ; 159
	i32 75, ; 160
	i32 5, ; 161
	i32 50, ; 162
	i32 36, ; 163
	i32 24, ; 164
	i32 114, ; 165
	i32 76, ; 166
	i32 100, ; 167
	i32 87, ; 168
	i32 61, ; 169
	i32 34, ; 170
	i32 68, ; 171
	i32 116, ; 172
	i32 85, ; 173
	i32 12, ; 174
	i32 69, ; 175
	i32 110, ; 176
	i32 55, ; 177
	i32 99, ; 178
	i32 60, ; 179
	i32 70, ; 180
	i32 58, ; 181
	i32 115, ; 182
	i32 72, ; 183
	i32 40, ; 184
	i32 46, ; 185
	i32 11, ; 186
	i32 86, ; 187
	i32 117, ; 188
	i32 24, ; 189
	i32 30, ; 190
	i32 4, ; 191
	i32 94, ; 192
	i32 3, ; 193
	i32 64, ; 194
	i32 69, ; 195
	i32 21, ; 196
	i32 39, ; 197
	i32 9, ; 198
	i32 117, ; 199
	i32 17, ; 200
	i32 33, ; 201
	i32 68, ; 202
	i32 89, ; 203
	i32 56, ; 204
	i32 83, ; 205
	i32 46, ; 206
	i32 35, ; 207
	i32 107, ; 208
	i32 41, ; 209
	i32 97, ; 210
	i32 104, ; 211
	i32 32, ; 212
	i32 81, ; 213
	i32 58, ; 214
	i32 112, ; 215
	i32 71, ; 216
	i32 53, ; 217
	i32 27, ; 218
	i32 9, ; 219
	i32 95, ; 220
	i32 48, ; 221
	i32 13, ; 222
	i32 110, ; 223
	i32 50, ; 224
	i32 102, ; 225
	i32 22, ; 226
	i32 20, ; 227
	i32 17, ; 228
	i32 40, ; 229
	i32 66, ; 230
	i32 89, ; 231
	i32 22, ; 232
	i32 47, ; 233
	i32 37, ; 234
	i32 66 ; 235
], align 4

@marshal_methods_number_of_classes = dso_local local_unnamed_addr constant i32 0, align 4

@marshal_methods_class_cache = dso_local local_unnamed_addr global [0 x %struct.MarshalMethodsManagedClass] zeroinitializer, align 4

; Names of classes in which marshal methods reside
@mm_class_names = dso_local local_unnamed_addr constant [0 x ptr] zeroinitializer, align 4

@mm_method_names = dso_local local_unnamed_addr constant [1 x %struct.MarshalMethodName] [
	%struct.MarshalMethodName {
		i64 0, ; id 0x0; name: 
		ptr @.MarshalMethodName.0_name; char* name
	} ; 0
], align 8

; get_function_pointer (uint32_t mono_image_index, uint32_t class_index, uint32_t method_token, void*& target_ptr)
@get_function_pointer = internal dso_local unnamed_addr global ptr null, align 4

; Functions

; Function attributes: "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" nofree norecurse nosync nounwind "stack-protector-buffer-size"="8" uwtable willreturn
define void @xamarin_app_init(ptr nocapture noundef readnone %env, ptr noundef %fn) local_unnamed_addr #0
{
	%fnIsNull = icmp eq ptr %fn, null
	br i1 %fnIsNull, label %1, label %2

1: ; preds = %0
	%putsResult = call noundef i32 @puts(ptr @.str.0)
	call void @abort()
	unreachable 

2: ; preds = %1, %0
	store ptr %fn, ptr @get_function_pointer, align 4, !tbaa !3
	ret void
}

; Strings
@.str.0 = private unnamed_addr constant [40 x i8] c"get_function_pointer MUST be specified\0A\00", align 1

;MarshalMethodName
@.MarshalMethodName.0_name = private unnamed_addr constant [1 x i8] c"\00", align 1

; External functions

; Function attributes: "no-trapping-math"="true" noreturn nounwind "stack-protector-buffer-size"="8"
declare void @abort() local_unnamed_addr #2

; Function attributes: nofree nounwind
declare noundef i32 @puts(ptr noundef) local_unnamed_addr #1
attributes #0 = { "min-legal-vector-width"="0" mustprogress "no-trapping-math"="true" nofree norecurse nosync nounwind "stack-protector-buffer-size"="8" "target-cpu"="generic" "target-features"="+armv7-a,+d32,+dsp,+fp64,+neon,+vfp2,+vfp2sp,+vfp3,+vfp3d16,+vfp3d16sp,+vfp3sp,-aes,-fp-armv8,-fp-armv8d16,-fp-armv8d16sp,-fp-armv8sp,-fp16,-fp16fml,-fullfp16,-sha2,-thumb-mode,-vfp4,-vfp4d16,-vfp4d16sp,-vfp4sp" uwtable willreturn }
attributes #1 = { nofree nounwind }
attributes #2 = { "no-trapping-math"="true" noreturn nounwind "stack-protector-buffer-size"="8" "target-cpu"="generic" "target-features"="+armv7-a,+d32,+dsp,+fp64,+neon,+vfp2,+vfp2sp,+vfp3,+vfp3d16,+vfp3d16sp,+vfp3sp,-aes,-fp-armv8,-fp-armv8d16,-fp-armv8d16sp,-fp-armv8sp,-fp16,-fp16fml,-fullfp16,-sha2,-thumb-mode,-vfp4,-vfp4d16,-vfp4d16sp,-vfp4sp" }

; Metadata
!llvm.module.flags = !{!0, !1, !7}
!0 = !{i32 1, !"wchar_size", i32 4}
!1 = !{i32 7, !"PIC Level", i32 2}
!llvm.ident = !{!2}
!2 = !{!"Xamarin.Android remotes/origin/release/8.0.4xx @ 82d8938cf80f6d5fa6c28529ddfbdb753d805ab4"}
!3 = !{!4, !4, i64 0}
!4 = !{!"any pointer", !5, i64 0}
!5 = !{!"omnipotent char", !6, i64 0}
!6 = !{!"Simple C++ TBAA"}
!7 = !{i32 1, !"min_enum_size", i32 4}
