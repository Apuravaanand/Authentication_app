import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { loginUser } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // Update form fields
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const data = await loginUser(form);

      // Save auth context
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || "Something went wrong!";
      setMessage(errorMsg);
      console.error("Login Error:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 max-w-md mx-auto bg-white rounded shadow space-y-4 mt-10"
    >
      <h1 className="text-2xl font-bold text-center mb-4">Login</h1>

      <InputField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Enter your email"
        required
        disabled={loading}
      />

      <InputField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Enter your password"
        required
        disabled={loading}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </Button>

      {message && (
        <p className="text-center mt-2 text-red-500 font-medium">{message}</p>
      )}

      <p className="text-center mt-4 text-sm">
        Don't have an account?{" "}
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Register
        </button>
      </p>
    </form>
  );
}
