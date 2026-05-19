import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Flow Builder discipline (EVO-1253): all interactive buttons must come
  // from @evoapi/design-system's <Button>, not raw <button>. Existing
  // violations carry an inline eslint-disable comment with a migration
  // pointer; the rule prevents NEW ones from creeping in.
  {
    files: ['src/components/journey/**/*.{ts,tsx}', 'src/pages/Customer/Journey/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.name='button']",
          message:
            'Use <Button> from @evoapi/design-system instead of raw <button>. See src/components/journey/_ui/README.md "Button contract" for the canonical variants.',
        },
      ],
    },
  },
)
