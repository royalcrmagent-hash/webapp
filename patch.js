const fs = require('fs');
let code = fs.readFileSync('src/components/views/LoginView.tsx', 'utf-8');
const newHandleSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const target = identifier.trim() || password.trim();
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: target, password: password })
      });
      const data = await response.json();
      
      if (data.success && data.user) {
        onLoginSuccess(data.user);
      } else {
        openPopup('Login Failed', data.error || 'Invalid credentials.');
      }
    } catch (err) {
      console.error(err);
      openPopup('Login Error', 'An error occurred while communicating with the authentication server.');
    } finally {
      setIsLoading(false);
    }
  };`;
const match = code.match(/  const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?    \}, 400\);\n  \};\n/);
if (match) {
  code = code.replace(match[0], newHandleSubmit + '\n');
  fs.writeFileSync('src/components/views/LoginView.tsx', code);
  console.log('patched LoginView.tsx');
} else {
  console.log('could not find handleSubmit');
}
