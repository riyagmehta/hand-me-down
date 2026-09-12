import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import Link from "next/link";
import Navbar from "../components/Navbar";

const VerifyEmail = () => {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	React.useEffect(() => {
		if (router.query.email) {
			setEmail(router.query.email);
		}
	}, [router.query.email]);

	const handleVerify = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const { data } = await axios.post("/api/auth/verify-email", { email, code });
			if (data.success) {
				toast.success("Email verified -- you can log in now");
				router.push("/login");
			} else {
				toast.error(data.msg);
			}
		} catch (err) {
			toast.error(err.response?.data?.msg || "Could not verify email");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		try {
			await axios.post("/api/auth/resend-verification", { email });
			toast.success("If that account needs verification, a new code was sent");
		} catch (err) {
			toast.error("Could not resend code");
		}
	};

	return (
		<>
			<Navbar />
			<div className="flex flex-col items-center mt-10 gap-4 px-4">
				<h1 className="text-3xl font-bold text-blue-500">Verify your email</h1>
				<p className="text-center max-w-md">
					Enter the 6-digit code sent to your school email address.
				</p>
				<form onSubmit={handleVerify} className="flex flex-col gap-3 w-full max-w-sm">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="Email"
						className="outline-none px-4 py-2 border-[1px] border-black"
						required
					/>
					<input
						type="text"
						value={code}
						onChange={(e) => setCode(e.target.value)}
						placeholder="6-digit code"
						maxLength={6}
						className="outline-none px-4 py-2 border-[1px] border-black"
						required
					/>
					<button
						type="submit"
						disabled={isLoading}
						className="px-4 py-2 uppercase font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-all duration-500 rounded-2"
					>
						{isLoading ? <BeatLoader color="white" /> : "Verify"}
					</button>
				</form>
				<button onClick={handleResend} className="underline text-blue-600">
					Resend code
				</button>
				<Link href="/login" className="underline">
					Back to login
				</Link>
			</div>
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default VerifyEmail;
