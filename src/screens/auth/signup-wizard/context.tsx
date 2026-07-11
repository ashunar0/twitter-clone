import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// signup wizard の in-memory 共有 state。
// - password は含めない (最終 step の RHF ローカル state に留めて、URL / storage に漏らさない)
// - refresh で state は失う仕様 (partial signup data は ephemeral、password 保全のため sessionStorage は使わない)
export type SignupWizardState = {
  email?: string;
  name?: string;
  handle?: string;
};

type SignupWizardContextValue = {
  state: SignupWizardState;
  update: (patch: Partial<SignupWizardState>) => void;
  reset: () => void;
};

const SignupWizardContext = createContext<SignupWizardContextValue | null>(null);

export function SignupWizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SignupWizardState>({});
  const update = useCallback(
    (patch: Partial<SignupWizardState>) => setState((s) => ({ ...s, ...patch })),
    [],
  );
  const reset = useCallback(() => setState({}), []);
  const value = useMemo(() => ({ state, update, reset }), [state, update, reset]);
  return (
    <SignupWizardContext.Provider value={value}>
      {children}
    </SignupWizardContext.Provider>
  );
}

// wizard context 取得。provider 外で呼んだら throw (guard として dev で気付ける)。
export function useSignupWizard(): SignupWizardContextValue {
  const ctx = useContext(SignupWizardContext);
  if (!ctx) throw new Error("useSignupWizard must be used inside SignupWizardProvider");
  return ctx;
}
