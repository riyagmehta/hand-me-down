import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import FormInputField from "../../../../../components/FormInputField";
import Image from "next/image";
import { BeatLoader } from "react-spinners";
import { getCookie } from "cookies-next";
import getUser from "../../../../../lib/getUser";
import Navbar from "../../../../../components/Navbar";
import {
	AiOutlineCloseCircle,
	AiOutlineDash,
	AiOutlinePlusCircle,
} from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import axiosInstance from "../../../../../axios/axios-instance";
import verifyJWT from "../../../../../lib/verifyJWT";
import axios from "axios";

const EditAddedItem = (props) => {
	const [isLoading, setIsLoading] = useState(false);
	// const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
	// 	useDropzone({
	// 		accept: {
	// 			"image/jpeg": [],
	// 			"image/png": [],
	// 		},
	// 		multiple: true,
	// 		maxFiles: 5,
	// 	});

	const {
		handleSubmit,
		register,
		formState: { errors },
		getValues,
		setValue,
		watch,
	} = useForm({});

	useEffect(() => {
		for (const field in props.product) {
			console.log(field);
			setValue(field, props.product[field]);
		}
	}, []);

	const handleUpdateItem = async (filledData) => {
		setIsLoading(true);

		try {
			const { data } = await axiosInstance.put(
				`/api/products/${filledData._id}`,
				filledData
			);
			if (data.success === true) {
				toast.success("Updated");
			}
			console.log("resp >> ", data);
		} catch (err) {
			console.log("err >> ", err);
		} finally {
			setIsLoading(false);
		}
	};

	const categoriesWatch = watch("categories");

	return (
		<>
			<Navbar />

			<h1 className="text-blue-500  font-semibold text-4xl  flex flex-row gap-2 items-center text-center mx-4 md:mx-28 mt-5">
				Edit item
			</h1>
			<div className="w-full mx-auto md:w-3/5">
				<form
					className="flex flex-col pt-3 md:pt-8 text-black  py-10 px-4 gap-4 lg:flex-row lg:flex-wrap lg:justify-center"
					onSubmit={handleSubmit(handleUpdateItem)}
				>
					<FormInputField
						name={"name"}
						errors={errors}
						register={register}
						isRequired={true}
						title={"Item Name"}
					/>

					<FormInputField
						name={"description"}
						errors={errors}
						register={register}
						isRequired={true}
						title={"Item Description"}
					/>

					<FormInputField
						name={"price"}
						errors={errors}
						register={register}
						isRequired={true}
						title={"Item Price"}
						type={"number"}
					/>
					<FormInputField
						name={"counts"}
						errors={errors}
						register={register}
						isRequired={true}
						title={"Item counts"}
						type={"number"}
					/>

					{/* categoried */}
					<div className="flex  flex-col gap-1 w-full ">
						<span className="uppercase font-semibold">{"Categories"}</span>
						<AiOutlinePlusCircle
							size={24}
							onClick={() => {
								let categories = categoriesWatch;
								if (!categories) categories = [];
								categories.push("");
								setValue("categories", categories);
							}}
						/>
						<div className="flex flex-row flex-wrap gap-2">
							{categoriesWatch?.map((category, index) => {
								return (
									<div className="flex flex-row" key={index}>
										<input
											type="text"
											{...register(`categories.${index}`, {
												required: "Category cannot be empty",
												minLength: 2,
											})}
											className="w-24 outline-none px-4 py-1 border-[1px] border-black "
										/>
										<AiOutlineCloseCircle
											onClick={() => {
												const newCategories = categoriesWatch.filter(
													(cat, catIndex) => catIndex != index
												);
												setValue("categories", newCategories);
											}}
											size={20}
										/>
									</div>
								);
							})}
						</div>
					</div>

					{/* condition */}
					<div className="flex  flex-col gap-1 w-full ">
						<span className="uppercase font-semibold">{"Categories *"}</span>
						<select
							type={"text"}
							className="outline-none px-4 py-1 border-[1px] border-black"
							{...register("condition", {
								minLength: 1,
								required: `Categories is required`,
							})}
						>
							<option value="very-good">Very Good</option>
							<option value="good">Good</option>
							<option value="average">Average</option>
							<option value="poor">Poor</option>
						</select>
					</div>

					<FormInputField
						name={"pickupAddress"}
						errors={errors}
						register={register}
						isRequired={true}
						title={"Pickup address"}
					/>
					<button
						type="submit"
						disabled={isLoading}
						className="w-full mt-10 px-4 py-2 uppercase font-semibold bg-black text-white hover:text-black hover:bg-white transition-all duration-500 border-black border-[1px] rounded-2 md:w-1/2 lg:w-42"
					>
						<span className="w-full uppercase ">
							{isLoading ? <BeatLoader color="white" /> : "Update Item"}
						</span>
					</button>
				</form>
			</div>
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default EditAddedItem;

export async function getServerSideProps({ req, res, params }) {
	const token = getCookie("token", { req, res });
	const { sid, pid } = params;
	const decodedToken = verifyJWT(token);

	if (sid == decodedToken.uid) {
		const { data } = await axiosInstance.get(`/api/products/${pid}`);
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
