import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../services/authService";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const res = await registerUser(form);
      setMessage(res.message || "OTP sent to your email");
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setMessage(
        err.response?.data?.message || err.message || "Something went wrong!"
      );
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 max-w-md mx-auto bg-white rounded shadow space-y-4 mt-10"
    >
      <h1 className="text-2xl font-bold text-center mb-4">Register</h1>

      <InputField
        label="Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Enter your name"
        required
        disabled={loading}
      />
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
        {loading ? "Registering..." : "Register"}
      </Button>

      <p className="text-center mt-4 text-sm">
        <button
          type="button"
          className="text-blue-600 hover:underline"
          onClick={() => navigate("/login")}
          disabled={loading}
        >
          Already a member? Login
        </button>
      </p>

      {message && (
        <p className={`text-center mt-2 ${isError ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
