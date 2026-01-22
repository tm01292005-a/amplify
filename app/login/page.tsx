import LoginForm from "../ui/login-form";
import { Container, Title, Center, Box } from "@mantine/core";

export default function LoginPage() {
  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container size={420} my={40}>
        <Title
          ta="center"
          style={{
            fontWeight: 900,
            marginBottom: "2rem",
          }}
        >
          サインイン
        </Title>
        <LoginForm />
      </Container>
    </Box>
  );
}
