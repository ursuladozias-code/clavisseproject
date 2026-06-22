"use client";

import { useState, type ReactNode } from "react";

// ============================================================
// TYPES
// ============================================================

type AuthView =
  | "login"
  | "forgot_password"
  | "forgot_password_confirmation"
  | "register_questions"
  | "register_infos"
  | "register_confirmation";

type ReponsePatrimoine = "oui" | "non" | "je_ne_sais_pas" | "";

interface RegisterData {
  copropriete: ReponsePatrimoine;
  immeubleRapport: ReponsePatrimoine;
  prenom: string;
  nom: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptCGU: boolean;
}

// ============================================================
// DESIGN
// ============================================================

const orange = "#ff7900";
const orangeDark = "#f97316";
const navy = "#0f1f33";
const muted = "#7b8798";
const border = "#e5e7eb";

// ============================================================
// UI GLOBALE
// ============================================================

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main
      className="min-h-screen w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8"
      style={{
        background:
          "radial-gradient(circle at top, #fff7ed 0%, #ffffff 38%, #fffaf4 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div className="mx-auto flex w-full max-w-[860px] flex-col items-center">
        {children}
      </div>
    </main>
  );
}

function BrandHeader() {
  return (
    <div className="mb-6 flex w-full flex-col items-center text-center sm:mb-8">
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-5xl shadow-xl sm:h-24 sm:w-24"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #fff8dc 0%, #facc15 28%, #d97706 72%, #92400e 100%)",
          }}
        >
          🔑
        </div>

        <div className="text-center sm:text-left">
          <h1
            className="text-5xl font-black leading-none tracking-tight sm:text-6xl md:text-7xl"
            style={{ color: navy }}
          >
            <span style={{ color: orange }}>C</span>lavisse
          </h1>

          <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start sm:gap-3">
            <span className="h-[2px] w-8 sm:w-10" style={{ backgroundColor: orange }} />
            <p
              className="text-[11px] font-semibold sm:text-sm"
              style={{ color: navy }}
            >
              simplifiez la gestion de votre patrimoine
            </p>
            <span className="h-[2px] w-8 sm:w-10" style={{ backgroundColor: orange }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityFooter() {
  return (
    <div
      className="mt-10 flex items-center justify-center gap-2 text-center text-sm font-semibold"
      style={{ color: muted }}
    >
      <span style={{ color: orange }}>🛡️</span>
      <span>Vos données sont sécurisées et confidentielles.</span>
    </div>
  );
}

function OrangeButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-[1.35rem] px-6 py-4 text-base font-black text-white shadow-xl transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50 sm:py-5 sm:text-lg"
      style={{
        background: "linear-gradient(135deg,#ff5b00,#ff9f1c)",
        boxShadow: "0 18px 35px rgba(255,121,0,0.22)",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-[1.35rem] px-6 py-4 text-base font-black transition hover:scale-[1.01] sm:py-5"
      style={{
        backgroundColor: "#f1f5f9",
        color: "#64748b",
      }}
    >
      {children}
    </button>
  );
}

function InputBox({
  label,
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
  rightIcon,
}: {
  label: string;
  icon: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  rightIcon?: ReactNode;
}) {
  return (
    <div className="w-full">
      <label
        className="mb-2 block text-base font-black sm:mb-3 sm:text-lg"
        style={{ color: navy }}
      >
        {label}
      </label>

      <div
        className="flex items-center gap-3 rounded-[1.25rem] border bg-white px-4 py-3.5 shadow-sm sm:gap-4 sm:rounded-[1.35rem] sm:px-5 sm:py-4"
        style={{ borderColor: border }}
      >
        <span className="shrink-0 text-xl sm:text-2xl" style={{ color: orange }}>
          {icon}
        </span>

        <input
          type={type}
          value={value}
          onChange={event => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-base font-semibold outline-none placeholder:font-medium sm:text-lg"
          style={{ color: navy }}
        />

        {rightIcon && <div className="shrink-0">{rightIcon}</div>}
      </div>
    </div>
  );
}

function Stepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Vos biens" },
    { id: 2, label: "Vos informations" },
    { id: 3, label: "Confirmation" },
  ] as const;

  return (
    <div className="mb-7 w-full max-w-[760px] sm:mb-8">
      <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="contents">
            <div className="flex flex-col items-center">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-base font-black sm:h-12 sm:w-12 sm:text-lg"
                style={{
                  backgroundColor: currentStep === step.id ? orange : "#fff",
                  borderColor: currentStep >= step.id ? orange : "#e5e7eb",
                  color:
                    currentStep === step.id
                      ? "#fff"
                      : currentStep > step.id
                        ? orange
                        : "#9ca3af",
                }}
              >
                {step.id}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className="mx-2 h-[2px] sm:mx-3"
                style={{
                  backgroundColor: currentStep > step.id ? orange : "#e5e7eb",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 text-center text-xs font-bold sm:text-base">
        {steps.map(step => (
          <p
            key={step.id}
            className="px-1 leading-4 sm:leading-5"
            style={{
              color: currentStep === step.id ? navy : muted,
              fontWeight: currentStep === step.id ? 900 : 600,
            }}
          >
            {step.label}
          </p>
        ))}
      </div>
    </div>
  );
}

function RegisterTitle({ subtitle }: { subtitle: string }) {
  return (
    <div className="mb-8 text-center">
      <h2 className="text-3xl font-black sm:text-4xl" style={{ color: navy }}>
        Création de votre compte
      </h2>

      <div
        className="mx-auto mt-4 h-1 w-16 rounded-full"
        style={{ backgroundColor: orange }}
      />

      <p
        className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 sm:text-lg sm:leading-8"
        style={{ color: muted }}
      >
        {subtitle}
      </p>
    </div>
  );
}

// ============================================================
// PAGE CONNEXION
// ============================================================

function LoginPage({
  onCreateAccount,
  onForgotPassword,
}: {
  onCreateAccount: () => void;
  onForgotPassword: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert("Veuillez renseigner votre adresse e-mail et votre mot de passe.");
      return;
    }

    alert("Connexion simulée côté Front-End.");
  };

  return (
    <AuthShell>
      <BrandHeader />

      <section className="w-full">
        <div className="mb-9 text-center">
          <h2 className="text-4xl font-black sm:text-5xl" style={{ color: navy }}>
            👋 Bienvenue !
          </h2>

          <p
            className="mt-6 text-lg font-medium leading-8 sm:text-xl sm:leading-9"
            style={{ color: muted }}
          >
            Connectez-vous à votre compte
            <br />
            pour accéder à votre tableau de bord.
          </p>
        </div>

        <div className="space-y-7">
          <InputBox
            label="Adresse e-mail"
            icon="👤"
            placeholder="votre@email.com"
            value={email}
            onChange={setEmail}
            type="email"
          />

          <InputBox
            label="Mot de passe"
            icon="🔒"
            placeholder="Votre mot de passe"
            value={password}
            onChange={setPassword}
            type={showPassword ? "text" : "password"}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-xl sm:text-2xl"
                style={{ color: "#8b8f98" }}
              >
                👁️
              </button>
            }
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setRememberMe(prev => !prev)}
              className="flex items-center gap-3 text-base font-semibold"
              style={{ color: navy }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2"
                style={{
                  borderColor: rememberMe ? orange : "#c7cbd1",
                  backgroundColor: rememberMe ? orange : "#fff",
                }}
              >
                {rememberMe && <span className="text-white">✓</span>}
              </span>
              Se souvenir de moi
            </button>

            <button
              type="button"
              className="text-left text-base font-bold underline sm:text-right"
              style={{ color: orange }}
              onClick={onForgotPassword}
            >
              Mot de passe oublié ?
            </button>
          </div>

          <OrangeButton onClick={handleLogin}>🔒 Se connecter</OrangeButton>
        </div>

        <div className="my-9 flex items-center gap-5">
          <div className="h-px flex-1" style={{ backgroundColor: border }} />
          <span className="font-semibold" style={{ color: muted }}>
            ou
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: border }} />
        </div>

        <div className="text-center text-base font-medium" style={{ color: muted }}>
          Pas encore de compte ?{" "}
          <button
            type="button"
            onClick={onCreateAccount}
            className="font-bold underline"
            style={{ color: orange }}
          >
            Créer un compte
          </button>
        </div>
      </section>

      <SecurityFooter />
    </AuthShell>
  );
}

// ============================================================
// MOT DE PASSE OUBLIÉ
// ============================================================

function ForgotPasswordPage({
  onBackToLogin,
  onSubmit,
}: {
  onBackToLogin: () => void;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) {
      alert("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    if (!email.includes("@")) {
      alert("Veuillez renseigner une adresse e-mail valide.");
      return;
    }

    onSubmit(email);
  };

  return (
    <AuthShell>
      <BrandHeader />

      <section className="w-full">
        <div className="mb-8 text-center">
          <h2
            className="text-3xl font-black sm:text-4xl md:text-5xl"
            style={{ color: navy }}
          >
            🔐 Mot de passe oublié ?
          </h2>

          <div
            className="mx-auto mt-4 h-1 w-16 rounded-full"
            style={{ backgroundColor: orange }}
          />

          <p
            className="mx-auto mt-6 max-w-xl text-base font-medium leading-7 sm:text-xl sm:leading-9"
            style={{ color: muted }}
          >
            Renseignez l’adresse e-mail associée à votre compte.
            <br className="hidden sm:block" />
            Nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <div className="w-full rounded-[1.6rem] bg-white p-5 shadow-xl sm:p-8">
          <InputBox
            label="Adresse e-mail"
            icon="✉️"
            placeholder="votre@email.com"
            value={email}
            onChange={setEmail}
            type="email"
          />

          <div
            className="mt-5 rounded-[1.25rem] p-4"
            style={{
              backgroundColor: "#eff6ff",
              border: "1px solid #bfdbfe",
            }}
          >
            <p className="text-sm font-semibold leading-6" style={{ color: "#1d4ed8" }}>
              Si un compte existe avec cette adresse, vous recevrez un lien de
              réinitialisation. Pour des raisons de sécurité, nous ne confirmons pas
              publiquement l’existence d’un compte.
            </p>
          </div>

          <div className="mt-7">
            <OrangeButton onClick={handleSubmit}>
              Envoyer le lien de réinitialisation
            </OrangeButton>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToLogin}
          className="mx-auto mt-8 flex items-center gap-2 text-base font-bold"
          style={{ color: navy }}
        >
          <span style={{ color: orange }}>←</span>
          Retour à la connexion
        </button>
      </section>

      <SecurityFooter />
    </AuthShell>
  );
}

function ForgotPasswordConfirmationPage({
  email,
  onBackToLogin,
  onResend,
}: {
  email: string;
  onBackToLogin: () => void;
  onResend: () => void;
}) {
  return (
    <AuthShell>
      <BrandHeader />

      <section className="w-full rounded-[1.6rem] bg-white p-6 text-center shadow-xl sm:p-8">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{ backgroundColor: "#fff7ed" }}
        >
          ✉️
        </div>

        <h2 className="text-3xl font-black sm:text-4xl" style={{ color: navy }}>
          Vérifiez votre boîte mail
        </h2>

        <div
          className="mx-auto mt-4 h-1 w-16 rounded-full"
          style={{ backgroundColor: orange }}
        />

        <p
          className="mx-auto mt-6 max-w-xl text-base font-medium leading-7 sm:text-lg sm:leading-8"
          style={{ color: muted }}
        >
          Si un compte est associé à l’adresse{" "}
          <span className="font-black" style={{ color: navy }}>
            {email}
          </span>
          , un lien de réinitialisation vient d’être envoyé.
        </p>

        <div
          className="mt-7 rounded-[1.25rem] p-4 text-left"
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <p className="text-sm font-semibold leading-6" style={{ color: muted }}>
            Pensez à vérifier vos courriers indésirables. Le lien de
            réinitialisation pourra expirer après un certain délai pour protéger
            votre compte.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <SecondaryButton onClick={onBackToLogin}>Retour à la connexion</SecondaryButton>

          <button
            type="button"
            onClick={onResend}
            className="rounded-[1.35rem] px-6 py-4 text-base font-black transition hover:scale-[1.01] sm:py-5"
            style={{
              backgroundColor: "#fff7ed",
              color: orange,
            }}
          >
            Renvoyer l’e-mail
          </button>
        </div>
      </section>

      <SecurityFooter />
    </AuthShell>
  );
}

// ============================================================
// QUESTIONS PATRIMOINE
// ============================================================

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[74px] items-center justify-center gap-3 rounded-[1.2rem] border px-4 text-base font-bold transition hover:shadow-sm"
      style={{
        borderColor: selected ? orange : border,
        backgroundColor: selected ? "#fff7ed" : "#fff",
        color: selected ? orangeDark : "#5f6b7a",
      }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border-2"
        style={{
          borderColor: selected ? orange : "#d1d5db",
          backgroundColor: selected ? orange : "#fff",
        }}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
      </span>
      {label}
    </button>
  );
}

function QuestionCard({
  emoji,
  title,
  value,
  onChange,
}: {
  emoji: string;
  title: string;
  value: ReponsePatrimoine;
  onChange: (value: ReponsePatrimoine) => void;
}) {
  return (
    <div className="rounded-[1.6rem] bg-white p-5 shadow-lg sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <div className="text-4xl">{emoji}</div>
        <h3 className="text-lg font-black leading-7 sm:text-xl" style={{ color: navy }}>
          {title}
        </h3>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ChoiceButton label="Oui" selected={value === "oui"} onClick={() => onChange("oui")} />
        <ChoiceButton label="Non" selected={value === "non"} onClick={() => onChange("non")} />
        <ChoiceButton
          label="Je ne sais pas"
          selected={value === "je_ne_sais_pas"}
          onClick={() => onChange("je_ne_sais_pas")}
        />
      </div>
    </div>
  );
}

function RegisterQuestionsPage({
  data,
  setData,
  onNext,
  onLogin,
}: {
  data: RegisterData;
  setData: (patch: Partial<RegisterData>) => void;
  onNext: () => void;
  onLogin: () => void;
}) {
  const handleContinue = () => {
    if (!data.copropriete || !data.immeubleRapport) {
      alert("Veuillez répondre aux deux questions.");
      return;
    }

    onNext();
  };

  return (
    <AuthShell>
      <BrandHeader />

      <Stepper currentStep={1} />

      <RegisterTitle subtitle="Avant de commencer, répondez à ces questions pour personnaliser votre expérience." />

      <div className="w-full space-y-6">
        <QuestionCard
          emoji="🏢"
          title="1. Je possède un ou plusieurs bien(s) en copropriété"
          value={data.copropriete}
          onChange={value => setData({ copropriete: value })}
        />

        <QuestionCard
          emoji="🏬"
          title="2. Je possède un immeuble de rapport"
          value={data.immeubleRapport}
          onChange={value => setData({ immeubleRapport: value })}
        />

        <OrangeButton onClick={handleContinue}>Continuer →</OrangeButton>

        <p className="text-center text-base font-medium" style={{ color: muted }}>
          Vous pourrez modifier ces informations plus tard
        </p>

        <div className="text-center text-base font-medium" style={{ color: muted }}>
          Déjà un compte ?{" "}
          <button type="button" onClick={onLogin} className="font-bold" style={{ color: orange }}>
            Se connecter
          </button>
        </div>
      </div>
    </AuthShell>
  );
}

// ============================================================
// FORMULAIRE CRÉATION COMPTE
// ============================================================

function RegisterInfosPage({
  data,
  setData,
  onBack,
  onNext,
}: {
  data: RegisterData;
  setData: (patch: Partial<RegisterData>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreate = () => {
    if (!data.prenom.trim() || !data.nom.trim()) {
      alert("Veuillez renseigner votre prénom et votre nom.");
      return;
    }

    if (!data.email.trim()) {
      alert("Veuillez renseigner votre adresse e-mail.");
      return;
    }

    if (!data.email.includes("@")) {
      alert("Veuillez renseigner une adresse e-mail valide.");
      return;
    }

    if (data.password.length < 8) {
      alert("Votre mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!data.acceptCGU) {
      alert(
        "Veuillez accepter les Conditions Générales d’Utilisation et la Politique de Confidentialité."
      );
      return;
    }

    onNext();
  };

  return (
    <AuthShell>
      <BrandHeader />

      <Stepper currentStep={2} />

      <RegisterTitle subtitle="Renseignez vos informations pour créer votre compte." />

      <section className="w-full rounded-[1.6rem] bg-white p-5 shadow-xl sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <InputBox
            label="Prénom"
            icon="👤"
            placeholder="Votre prénom"
            value={data.prenom}
            onChange={value => setData({ prenom: value })}
          />

          <InputBox
            label="Nom"
            icon="👤"
            placeholder="Votre nom"
            value={data.nom}
            onChange={value => setData({ nom: value })}
          />
        </div>

        <div className="mt-6">
          <InputBox
            label="Adresse e-mail"
            icon="✉️"
            placeholder="votre@email.com"
            value={data.email}
            onChange={value => setData({ email: value })}
            type="email"
          />

          <p className="mt-3 text-sm font-medium" style={{ color: muted }}>
            Cette adresse e-mail sera utilisée pour vous connecter.
          </p>
        </div>

        <div className="mt-6">
          <InputBox
            label="Mot de passe"
            icon="🔒"
            placeholder="Créez votre mot de passe"
            value={data.password}
            onChange={value => setData({ password: value })}
            type={showPassword ? "text" : "password"}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="text-xl sm:text-2xl"
                style={{ color: "#8b8f98" }}
              >
                👁️
              </button>
            }
          />

          <p className="mt-3 text-sm font-medium" style={{ color: muted }}>
            8 caractères minimum avec une majuscule, une minuscule et un chiffre.
          </p>
        </div>

        <div className="mt-6">
          <InputBox
            label="Confirmer le mot de passe"
            icon="🔒"
            placeholder="Confirmez votre mot de passe"
            value={data.confirmPassword}
            onChange={value => setData({ confirmPassword: value })}
            type={showConfirm ? "text" : "password"}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(prev => !prev)}
                className="text-xl sm:text-2xl"
                style={{ color: "#8b8f98" }}
              >
                👁️
              </button>
            }
          />
        </div>

        <button
          type="button"
          onClick={() => setData({ acceptCGU: !data.acceptCGU })}
          className="mt-7 flex items-start gap-3 text-left text-base font-semibold leading-8"
          style={{ color: navy }}
        >
          <span
            className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2"
            style={{
              borderColor: data.acceptCGU ? orange : "#c7cbd1",
              backgroundColor: data.acceptCGU ? orange : "#fff",
            }}
          >
            {data.acceptCGU && <span className="text-white">✓</span>}
          </span>

          <span>
            J&apos;accepte les{" "}
            <span className="underline" style={{ color: orange }}>
              Conditions Générales d’Utilisation
            </span>{" "}
            et la{" "}
            <span className="underline" style={{ color: orange }}>
              Politique de Confidentialité
            </span>
          </span>
        </button>

        <div className="mt-8">
          <OrangeButton onClick={handleCreate}>👥 Créer mon compte</OrangeButton>
        </div>
      </section>

      <button
        type="button"
        onClick={onBack}
        className="mt-8 flex items-center gap-2 text-base font-bold"
        style={{ color: navy }}
      >
        <span style={{ color: orange }}>←</span>
        Retour aux questions
      </button>

      <SecurityFooter />
    </AuthShell>
  );
}

// ============================================================
// CONFIRMATION CRÉATION COMPTE
// ============================================================

function formatAnswer(value: ReponsePatrimoine) {
  if (value === "oui") return "Oui";
  if (value === "non") return "Non";
  if (value === "je_ne_sais_pas") return "Je ne sais pas";
  return "—";
}

function RegisterConfirmationPage({
  data,
  onLogin,
}: {
  data: RegisterData;
  onLogin: () => void;
}) {
  return (
    <AuthShell>
      <BrandHeader />

      <Stepper currentStep={3} />

      <RegisterTitle subtitle="Votre compte a été créé avec succès. Vous pouvez maintenant accéder à votre tableau de bord." />

      <section className="w-full rounded-[1.6rem] bg-white p-6 text-center shadow-xl sm:p-8">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-4xl"
          style={{ backgroundColor: "#dcfce7" }}
        >
          ✅
        </div>

        <h2 className="text-3xl font-black" style={{ color: navy }}>
          Bienvenue {data.prenom || "sur Clavisse"} !
        </h2>

        <p
          className="mx-auto mt-4 max-w-xl text-base font-medium leading-7"
          style={{ color: muted }}
        >
          Votre espace est prêt. Les réponses liées à votre patrimoine permettront de
          personnaliser votre expérience dans l’application.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.2rem] p-4" style={{ backgroundColor: "#f8fafc" }}>
            <p className="text-xs font-black uppercase" style={{ color: muted }}>
              Copropriété
            </p>
            <p className="mt-1 text-lg font-black" style={{ color: navy }}>
              {formatAnswer(data.copropriete)}
            </p>
          </div>

          <div className="rounded-[1.2rem] p-4" style={{ backgroundColor: "#f8fafc" }}>
            <p className="text-xs font-black uppercase" style={{ color: muted }}>
              Immeuble de rapport
            </p>
            <p className="mt-1 text-lg font-black" style={{ color: navy }}>
              {formatAnswer(data.immeubleRapport)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <OrangeButton onClick={onLogin}>Se connecter</OrangeButton>
        </div>
      </section>

      <SecurityFooter />
    </AuthShell>
  );
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function AuthPagesClavisse() {
  const [view, setView] = useState<AuthView>("login");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const [registerData, setRegisterData] = useState<RegisterData>({
    copropriete: "",
    immeubleRapport: "",
    prenom: "",
    nom: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptCGU: false,
  });

  const updateRegisterData = (patch: Partial<RegisterData>) => {
    setRegisterData(prev => ({
      ...prev,
      ...patch,
    }));
  };

  if (view === "forgot_password") {
    return (
      <ForgotPasswordPage
        onBackToLogin={() => setView("login")}
        onSubmit={email => {
          setForgotPasswordEmail(email);
          setView("forgot_password_confirmation");
        }}
      />
    );
  }

  if (view === "forgot_password_confirmation") {
    return (
      <ForgotPasswordConfirmationPage
        email={forgotPasswordEmail}
        onBackToLogin={() => setView("login")}
        onResend={() => {
          alert("Nouvel e-mail de réinitialisation simulé côté Front-End.");
        }}
      />
    );
  }

  if (view === "register_questions") {
    return (
      <RegisterQuestionsPage
        data={registerData}
        setData={updateRegisterData}
        onNext={() => setView("register_infos")}
        onLogin={() => setView("login")}
      />
    );
  }

  if (view === "register_infos") {
    return (
      <RegisterInfosPage
        data={registerData}
        setData={updateRegisterData}
        onBack={() => setView("register_questions")}
        onNext={() => setView("register_confirmation")}
      />
    );
  }

  if (view === "register_confirmation") {
    return (
      <RegisterConfirmationPage
        data={registerData}
        onLogin={() => setView("login")}
      />
    );
  }

  return (
    <LoginPage
      onCreateAccount={() => setView("register_questions")}
      onForgotPassword={() => setView("forgot_password")}
    />
  );
}