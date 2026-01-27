import { getCookie, getCookies } from "cookies-next";
import axiosInstance from "../axios/axios-instance";
import verifyJWT from "../lib/verifyJWT";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import FormInputField from "../components/FormInputField";
import { useForm } from "react-hook-form";
import { BeatLoader } from "react-spinners";
import Footer from "../components/Footer";
import { ToastContainer, toast } from "react-toastify";
const Profile = (props) => {
	const [user, setUser] = useState(props);
	const [isLoading, setIsLoading] = useState(false);

	const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
		useDropzone({
			accept: {
				"image/jpeg": [],
				"image/png": [],
			},
			multiple: false,
		});

	const {
		handleSubmit,
		register,
		formState: { errors },
		getValues,
		setValue,
	} = useForm({});

	useEffect(() => {
		for (const field in user) {
			setValue(field, user[field]);
		}
	});

	const handleLogin = async (filledData) => {
		let formData = new FormData();
		formData.append("user", JSON.stringify(filledData));
		if (acceptedFiles.length == 1) {
			formData.append("avatar", acceptedFiles[0]);
		}
		setIsLoading(true);
		try {
			console.log(filledData._id);
			const { data } = await axiosInstance.put(
				`/api/users/${filledData._id}`,
				formData
			);
			if (data.success === true) {
				toast.success("Updated");
				setUser(data.data);
			}
			console.log("resp >> ", data);
		} catch (err) {
			console.log("err >> ", err);
		} finally {
			setIsLoading(false);
		}
	};
	return (
		<>
			<Navbar focusOn={"profile"} />
			<div className="flex flex-col items-center w-full md:mx-24 md:w-auto lg:mx-52">
				<h1 className="text-3xl text-center my-4 ">
					Welcome{" "}
					<span className="font-semibold uppercase">{user.firstName}</span>
				</h1>

				{acceptedFiles.length == 1 ? (
					<Image
						src={URL.createObjectURL(acceptedFiles[0])}
						width={0}
						alt="profile pic"
						height={0}
						className="w-52 h-52 rounded-full"
					/>
				) : (
					<Image
						src={user.avatarURL || require("../public/avatar.webp")}
						width={400}
						height={400}
						alt="profile pic"
						className="w-52 h-52 rounded-full object-center object-cover my-5"
					/>
				)}
				<button
					{...getRootProps({ className: "dropzone" })}
					className="border-black border-[1px] px-2 hover:bg-black hover:text-white transition-colors duration-300"
				>
					<input {...getInputProps()} />
					<p>Chang Profile Picture</p>
				</button>

				{/* Input fields */}
				<div className="w-full">
					<form
						className="flex flex-col pt-3 md:pt-8 text-black  py-10 px-4 gap-4 lg:flex-row lg:flex-wrap lg:justify-center"
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
							className="w-full mt-10 px-4 py-2 uppercase font-semibold bg-blue-500 text-white  hover:bg-blue-400 transition-all duration-500  rounded-2 md:w-1/2 lg:w-42"
						>
							<span className="w-full uppercase ">
								{isLoading ? <BeatLoader color="white" /> : "Update"}
							</span>
						</button>
					</form>
				</div>
			</div>
			<ToastContainer theme="dark" position="bottom-right" />
			<Footer />
		</>
	);
};

export default Profile;

export async function getServerSideProps({ req, res }) {
	const token = getCookie("token", { req, res });
	const decodedToken = verifyJWT(token);
	if (decodedToken) {
		const { uid } = decodedToken;
		const { data } = await axiosInstance.get(`/api/users/${uid}`);
		return {
			props: data.data,
		};
	} else {
		return {
			redirect: {
				destination: "/login",
			},
		};
	}
}
