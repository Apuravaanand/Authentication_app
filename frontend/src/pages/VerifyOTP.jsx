import { useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { verifyOtp } from "../services/authService";
import { AuthContext } from "../context/AuthContext";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AuthContext);

  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return setMessage("Please enter OTP");

    setMessage("");
    setLoading(true);

    try {
      const data = await verifyOtp({ email, otp });
      setToken(data.token);
      setUser({ _id: data._id, name: data.name, email: data.email });
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 max-w-md mx-auto bg-white rounded shadow space-y-4 mt-10"
    >
      <h1 className="text-2xl font-bold text-center mb-4">Verify OTP</h1>

      <InputField
        label="OTP"
        name="otp"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        required
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Verifying..." : "Verify"}
      </Button>

      {message && <p className="text-red-500 text-center mt-2">{message}</p>}
    </form>
  );
}
