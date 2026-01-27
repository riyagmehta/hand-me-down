import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SellingProductCard from "../components/SellingProductCard";
import verifyJWT from "../lib/verifyJWT";
import axiosInstance from "../axios/axios-instance";
import { getCookie } from "cookies-next";
import Link from "next/link";
import Image from "next/image";
import { AiOutlineHeart, AiOutlinePlusCircle } from "react-icons/ai";
import WishListProductCard from "../components/WishListProductCard";
import { ToastContainer } from "react-toastify";
import Footer from "../components/Footer";

const Wishlist = (props) => {
	const [products, setProducts] = useState([]);
	useEffect(() => {
		setProducts(props.data.data);
	}, []);

	return (
		<>
			<Navbar focusOn={"wishlist"} />
			<div className="flex flex-col md:mx-24 min-h-screen">
				<div className=" my-4 mx-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
					<h1 className="text-3xl uppercase flex flex-row gap-2 items-center text-blue-500 font-semibold">
						Your wishlist <AiOutlineHeart size={36} />
					</h1>
				</div>
				{products && products.length > 0 ? (
					products.map((product) => {
						return (
							<WishListProductCard
								{...product}
								uid={props.uid}
								key={product._id}
							/>
						);
					})
				) : (
					<Image
						src={require("../public/empty.jpg")}
						alt="Banner"
						className="h-50vh md:h-screen w-auto object-contain"
					/>
				)}
			</div>
			<Footer />
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default Wishlist;

export async function getServerSideProps({ req, res }) {
	const token = getCookie("token", { req, res });
	const decodedToken = verifyJWT(token);
	if (decodedToken) {
		const { uid } = decodedToken;
		const { data } = await axiosInstance.get(`/api/users/${uid}/wishlist`);
		return {
			props: { data, uid },
		};
	} else {
		return {
			redirect: {
				destination: "/login",
			},
		};
	}
}
