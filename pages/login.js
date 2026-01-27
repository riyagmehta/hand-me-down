import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import loginImage from "../public/register2.jpg";
import { AiOutlineMail, AiOutlineLock } from "react-icons/ai";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import Error from "../components/Error";
import Link from "next/link";
import Navbar from "../components/Navbar";
const Login = () => {
	const {
		handleSubmit,
		register,
		formState: { errors },
		getValues,
	} = useForm({});
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = () => {
		setIsLoading(true);
		const email = getValues("email");
		const password = getValues("password");

		axios
			.post("/api/auth/login", { email, password }, { withCredentials: true })
			.then((response) => {
				return response.data;
			})
			.then((data) => {
				if (data.success === false) {
					toast.error(data.msg);
					return;
				} else {
					router.push("/");
				}
				console.log(data);
			})
			.then(() => setIsLoading(false))
			.catch((error) => {
				toast.error("Invalid credentials");
				console.log(error);
				setIsLoading(false);
			});
	};

	return (
		<>
			<div className="w-screen min-h-screen ">
				<Navbar focusOn={"login"} />
				<div className="flex flex-wrap w-full items-center justify-center">
					<div className="flex flex-col w-full md:w-1/2 mt-5">
						<h1 className="text-4xl font-bold text-center mt-4  text-blue-500">
							Login
						</h1>

						<div className="flex flex-col  justify-center px-8 pt-8 my-auto md:justify-start md:pt-0 md:px-24 lg:px-32">
							<form
								className="flex flex-col py-3 md:pt-8 text-black  px-4"
								onSubmit={handleSubmit(handleLogin)}
							>
								<div className="flex flex-col pt-4">
									<div className="flex relative ">
										<span className=" inline-flex  items-center px-3 border-t  border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
											<AiOutlineMail size={24} color="blue" />
										</span>
										<input
											{...register("email", {
												minLength: 1,
												required: "Email can't be empty",
											})}
											name="email"
											type="text"
											id="design-login-email"
											className=" flex-1 appearance-none border border-gray-300 w-full py-2 px-4  text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent "
											placeholder="Email"
										/>
									</div>
								</div>
								<Error msg={errors.email?.message || ""} />
								<div className="flex flex-col pt-4 ">
									<div className="flex relative ">
										<span className=" inline-flex  items-center px-3 border-t  border-l border-b  border-gray-300 text-gray-500 shadow-sm text-sm">
											<AiOutlineLock size={24} color="blue" />
										</span>
										<input
											{...register("password", {
												minLength: 1,
												required: "Password cannot be empty",
											})}
											name="password"
											type="password"
											id="design-login-password"
											className=" flex-1 appearance-none border border-gray-300 w-full py-2 px-4  text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
											placeholder="Password"
										/>
									</div>
								</div>
								<Error msg={errors.password?.message || ""} />

								<button
									type="submit"
									disabled={isLoading}
									// className="w-full px-4 py-2 mt-10 text-base font-semibold text-center transition duration-200 ease-in  shadow-md hover:bg-hover focus:outline-none focus:ring-2"
									className="w-full mt-4 px-4 py-2  font-semibold bg-blue-500 text-white  hover:bg-blue-400 transition-all duration-500 rounded-2"
								>
									<span className="w-full ">
										{isLoading ? <BeatLoader color="white" /> : "Login"}
									</span>
								</button>
							</form>
							<div className=" pb-12 text-center">
								<p>
									Don&#x27;t have an account ?
									<Link href="/register" className="font-semibold underline">
										Register here.
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
				<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
			</div>
		</>
	);
};

export default Login;
