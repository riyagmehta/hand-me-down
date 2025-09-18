import React, { useEffect, useState } from "react";
import axiosInstance from "../../axios/axios-instance";
import bookImg from "../../public/book.jpg";
import Image from "next/image";
import Navbar from "../../components/Navbar";

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { useRouter } from "next/router";
import getUser from "../../lib/getUser";
import { verify } from "jsonwebtoken";
import { getCookie, getCookies } from "cookies-next";
import { ToastContainer, toast } from "react-toastify";
import verifyJWT from "../../lib/verifyJWT";
import { AiOutlineMail, AiOutlinePhone, AiOutlineUser } from "react-icons/ai";
const ProductView = (props) => {
	const [product, setProduct] = useState(props.product);
	const [seller, setSeller] = useState(props.seller);
	const [token, setToken] = useState();
	console.log("seller >> ", props.seller);

	useEffect(() => {
		// setProduct(props.product);
		// setSeller(props.seller);
		const token = getCookie("token");
		const decodedToken = verifyJWT(token);
		setToken(decodedToken);
	}, []);

	const router = useRouter();

	const handleAddToWishList = async () => {
		if (!token || !token.uid) {
			router.push("/login");
		}
		try {
			const { data } = await axiosInstance.put(
				`/api/users/${token.uid}/wishlist/add`,
				{
					pid: product._id,
				}
			);

			if (data.success === true) {
				toast.success("Added to Wishlist");
			}
			console.log("resp >> ", data);
		} catch (err) {
			console.log("err >> ", err);
		} finally {
		}
	};

	return (
		<>
			<Navbar />
			<div
				key={product._id}
				className="flex flex-col-reverse items-center md:flex-row md:justify-center md:gap-12 my-5 mx-4 md:mx-24"
			>
				<div className="flex flex-col gap-3  md:w-1/2">
					<h1 className=" font-bold text-4xl text-blue-500">{product.name}</h1>
					<p className=" text-gray-800">{product.description}</p>
					<p>
						<span className="font-semibold">Availabe :</span> {product.counts}
					</p>
					<p>
						<span className="font-semibold">Price :</span> {product.price}
					</p>
					<p>
						<span className="font-semibold">Address :</span>
						{product.pickupAddress}
					</p>
					<p>
						<a
							href={`https://www.google.com/maps/search/${product.pickupAddress}`}
							className="bg-blue-500 text-white  hover:bg-blue-400 px-4 py-2 "
							target="_blank"
						>
							View On Map
						</a>
					</p>
					<div>
						<p className="font-semibold">Categories :</p>
						<div className="flex flex-row gap-2 my-2">
							{product.categories?.map((category, index) => {
								return (
									<span
										key={index}
										className="px-2 py-1 border-[1px] border-black rounded-sm"
									>
										{category}
									</span>
								);
							})}
						</div>
					</div>
					<div>
						<p className="font-semibold">Seller : </p>
						<div className="flex mt-2 flex-row gap-3 items-center">
							<AiOutlineUser size={24} />
							<p>{seller.firstName + " " + seller.middleName}</p>
						</div>
						<div className="flex mt-2 flex-row gap-3 items-center">
							<AiOutlinePhone size={24} />
							<a href={`tel:+91${seller.phoneNumber}`}> {seller.phoneNumber}</a>
						</div>
						<div className="mt-2 flex flex-row gap-3 items-center">
							<AiOutlineMail size={24} />
							<a href={`mailto:${seller.email}`}>{seller.email}</a>
						</div>
					</div>
					<button
						type="button"
						onClick={handleAddToWishList}
						className="px-4 py-2 uppercase font-semibold bg-blue-500 text-white  hover:bg-blue-400 transition-all duration-500  rounded-2"
					>
						Add To Wishlist
					</button>
				</div>
				<div className="md:w-1/2">
					{product.productImages.length > 0 && (
						<Carousel autoPlay={true} infiniteLoop={true} className="w-full">
							{product.productImages.map((image, index) => {
								return (
									<Image
										key={index}
										src={image}
										width={800}
										height={800}
										alt="product image"
										className="object-contain object-center"
									/>
								);
							})}
						</Carousel>
					)}
				</div>
			</div>
			<div></div>
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default ProductView;

export async function getServerSideProps({ req, res, params }) {
	const { pid } = params;

	try {
		const { data } = await axiosInstance.get(`/api/products/${pid}`);
		return { props: data.data };
	} catch (err) {
		return {
			notFound: true,
		};
	}
}
