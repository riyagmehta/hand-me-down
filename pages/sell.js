import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getCookie, getCookies, setCookie } from "cookies-next";
import axiosInstance from "../axios/axios-instance";
import verifyJWT from "../lib/verifyJWT";
import SellingProductCard from "../components/SellingProductCard";
import { AiOutlinePlusCircle } from "react-icons/ai";
import Link from "next/link";
import Footer from "../components/Footer";
import Image from "next/image";

const Sell = (props) => {
	const [sellingProducts, setSellingProducts] = useState([]);
	useEffect(() => {
		setSellingProducts(props.data);
	}, []);
	return (
		<>
			<Navbar focusOn={"sell"} />
			<div className="flex flex-col min-h-80vh">
				<div className=" my-4 mx-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
					<h1 className="mx-10 text-3xl text-center text-blue-600 font-semibold">
						Your items for sell
					</h1>
					<Link href="/additem">
						<button className="w-44 flex flex-row items-center justify-center gap-3 text-xl uppercase bg-blue-500 text-white  hover:bg-blue-400 fond-semibold px-4 py-2 rounded-sm">
							<AiOutlinePlusCircle size={24} /> Add item
						</button>
					</Link>
				</div>
				{sellingProducts && sellingProducts.length > 0 ? (
					sellingProducts.map((product) => {
						return <SellingProductCard {...product} key={product._id} />;
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
		</>
	);
};
export default Sell;

export async function getServerSideProps({ req, res }) {
	const token = getCookie("token", { req, res });
	const decodedToken = verifyJWT(token);
	if (decodedToken) {
		const { uid } = decodedToken;
		const { data } = await axiosInstance.get(`/api/products?seller=${uid}`);
		return {
			props: data,
		};
	} else {
		return {
			redirect: {
				destination: "/login",
			},
		};
	}
}
