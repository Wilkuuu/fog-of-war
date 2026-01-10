# Konfiguracja Branch Protection Rules

Aby wymusić, że wszystkie branche muszą się zbudować przed mergem, należy skonfigurować Branch Protection Rules w GitHubie.

## Kroki konfiguracji:

1. Przejdź do repozytorium na GitHubie
2. Kliknij **Settings** → **Branches**
3. Kliknij **Add rule** lub edytuj istniejącą regułę dla głównych branchy (main/master)

## Wymagane ustawienia:

### Dla branchy `main`/`master`:

- ✅ **Require a pull request before merging**
  - Require approvals: 1 (lub więcej)
  - Dismiss stale pull request approvals when new commits are pushed
  
- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Status checks wymagane:**
    - `PR Build Check / build-check` (dla PR)
    - `Build Android APK / build-android` (dla push)

- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**

### Dla branchy `develop`/`dev` (opcjonalnie):

Można zastosować podobne ustawienia, ale z mniejszą liczbą wymaganych approvalów.

## Jak to działa:

1. Gdy ktoś tworzy Pull Request, automatycznie uruchamia się workflow `PR Build Check`
2. Jeśli build się nie powiedzie, PR nie może być zmergowany (status check będzie czerwony)
3. Komentarz zostanie automatycznie dodany do PR z informacją o statusie builda
4. Tylko gdy build przejdzie pomyślnie, można zmergować PR

## Sprawdzenie statusu:

- Status checks są widoczne na dole każdego PR
- Zielony znaczek ✅ = build pomyślny, można mergować
- Czerwony znaczek ❌ = build nieudany, nie można mergować

## Uwaga:

Po skonfigurowaniu branch protection rules, nawet administratorzy nie będą mogli zmergować PR bez pomyślnego builda (chyba że wyłączysz opcję "Do not allow bypassing").
