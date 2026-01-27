import Head from "next/head";
import Image from "next/image";
import Navbar from "../components/Navbar";
import { AiOutlineSearch } from "react-icons/ai";
import axiosInstance from "../axios/axios-instance";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { getCookie, getCookies } from "cookies-next";
import getUser from "../lib/getUser";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home(props) {
	const [products, setProducts] = useState([]);
	const [filter, setFilter] = useState({ keyword: "" });
	useEffect(() => {
		setProducts(props.data);
	}, []);

	const fetchProducts = async (filter) => {
		let filterURL = "";
		for (const query in filter) {
			filterURL += `${query}=${filter[query]}&`;
		}
		console.log("filter >> ", filterURL);
		const { data } = await axiosInstance.get(`/api/products?${filterURL}`);
		setProducts(data.data);
	};

	const handleFilterChange = (e) => {
		setFilter({ ...filter, [e.target.name]: e.target.value });
		fetchProducts({ ...filter, [e.target.name]: e.target.value });
	};
	return (
		<div>
			{/* Navbar */}
			<Navbar focusOn={"home"} />
			<div className="md:flex md:flex-row">
				<Image
					src={require("../public/home-wide.jpg")}
					alt="Banner"
					className="md:w-2/3  h-auto bg-fixed"
				/>

				<div className="px-4 md:w-1/3 flex flex-col justify-center">
					<h1 className="text-5xl text-center text-blue-500 font-semibold">
						Hand Me Down
					</h1>
					<p className="text-2xl text-center my-5">
						Save money and get everything that you need - books, household items
						and more - from peers near you!
					</p>
					<div className="flex flex-row justify-center items-center mt-3">
						<Link href="/about">
							<button className="mx-auto bg-[#5b7dd7] text-white  hover:bg-[#789fff] text-lg duration-300 transition-all px-5 py-3 rounded-md ">
								Know More
							</button>
						</Link>
					</div>
				</div>
			</div>

			<p className="text-5xl text-blue-600 mx-5 mt-7 text-center">
				Explore products{" "}
			</p>

			{/* Search box */}
			<div className="mt-9 mx-3 my-4 px-3 rounded-md flex flex-row gap-0 items-center border-blue-500 border-[1px] md:mx-12 lg:mx-52">
				<AiOutlineSearch size={28} color="blue" />
				<input
					type="text"
					className="outline-none px-4 py-2 w-full"
					placeholder="search..."
					name="keyword"
					value={filter.keyword}
					onChange={handleFilterChange}
				/>
			</div>
			{/* Products */}
			<div className="md:flex md:flex-row justify-center  flex-wrap lg:mx-52">
				{products?.map((product) => {
					return <ProductCard {...product} key={product._id} />;
				})}
			</div>

			{/* Footer */}
			<Footer />
		</div>
	);
}

export async function getServerSideProps({ req, res }) {
	console.log("cookies >> ", getCookie("uid", { req, res }));
	console.log("all cookies >> ", getCookies({ req, res }));
	const { data } = await axiosInstance.get(`/api/products`);
	return { props: data };
}
