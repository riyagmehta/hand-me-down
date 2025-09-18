import React, { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/router";
import Link from "next/link";
import Navbar from "../components/Navbar";
import FormInputField from "../components/FormInputField";

const Register = () => {
	const {
		handleSubmit,
		register,
		formState: { errors },
		getValues,
	} = useForm({});
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = (filledData) => {
		setIsLoading(true);
		const email = getValues("email");
		const password = getValues("password");

		axios
			.post("/api/users", filledData, { withCredentials: true })
			.then((response) => {
				return response.data;
			})
			.then((data) => {
				if (data.success === false) {
					toast.error(data.msg);
					return;
				} else {
					toast.success("Account created ☑️");
					// router.push("/login");
				}
				console.log(data);
			})
			.then(() => setIsLoading(false))
			.catch((error) => {
				console.log(error);
				setIsLoading(false);
			});
	};

	return (
		<>
			<div className="w-screen min-h-screen ">
				<Navbar focusOn={"register"} />
				<div className="flex flex-wrap w-full items-center justify-center">
					<div className="flex flex-col w-full md:w-2/3 shadow-xl mt-5">
						<h1 className="text-4xl font-bold text-center mt-4 text-blue-500">
							Create an account
						</h1>

						<div className="flex flex-col  justify-center px-8 pt-8 my-auto md:justify-start md:pt-0 md:px-24 lg:px-32">
							<form
								className="flex flex-col pt-3 md:pt-8 text-black  py-3 px-4 gap-4"
								onSubmit={handleSubmit(handleLogin)}
							>
								<FormInputField
									name={"firstName"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"First Name"}
								/>
								<FormInputField
									name={"middleName"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Middle Name"}
								/>
								<FormInputField
									name={"lastName"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Last Name"}
								/>
								<FormInputField
									name={"dateOfBirth"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Date of birth"}
									type={"date"}
								/>

								<FormInputField
									name={"email"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Email"}
								/>

								<FormInputField
									name={"phoneNumber"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Phone Number"}
								/>

								<FormInputField
									name={"password"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Password"}
									type={"password"}
								/>

								<FormInputField
									name={"address.city"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"City"}
								/>
								<FormInputField
									name={"address.district"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"District"}
								/>
								<FormInputField
									name={"address.state"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"State"}
								/>

								<FormInputField
									name={"address.postalCode"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Postal code"}
									type={Number}
								/>

								<FormInputField
									name={"address.completeAddress"}
									errors={errors}
									register={register}
									isRequired={true}
									title={"Complete Address"}
								/>

								<button
									type="submit"
									disabled={isLoading}
									className="w-full mt-3 px-4 py-2  font-semibold bg-blue-500 text-white hover:bg-blue-400 transition-all duration-500 rounded-2"
								>
									<span className="w-full  ">
										{isLoading ? (
											<BeatLoader color="black" />
										) : (
											"Create an account"
										)}
									</span>
								</button>
							</form>
							<div className=" pb-12 text-center">
								<p>
									Already have an account ?
									<Link href="/login" className="font-semibold underline">
										{" "}
										Login here.
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default Register;
