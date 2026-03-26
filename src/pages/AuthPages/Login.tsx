import LoginForm from "../../components/auth/LoginForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

export default function Login() {
  return (
    <>
      <PageMeta
        title="Workflow Login"
        description="Workflow Login"
      />
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </>
  );
}
