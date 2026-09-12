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
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

const Sell = (props) => {
	const router = useRouter();
	const [sellingProducts, setSellingProducts] = useState([]);
	const [bundleMode, setBundleMode] = useState(false);
	const [selectedIds, setSelectedIds] = useState([]);
	const [bundlePrice, setBundlePrice] = useState("");

	useEffect(() => {
		setSellingProducts(props.data);
	}, []);

	const toggleSelected = (id) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((existing) => existing !== id) : [...prev, id]
		);
	};

	const handleCreateBundle = async () => {
		if (selectedIds.length < 2) {
			toast.error("Select at least 2 items to bundle");
			return;
		}
		if (!bundlePrice || Number(bundlePrice) < 0) {
			toast.error("Enter a valid bundle price");
			return;
		}
		try {
			const { data } = await axiosInstance.post("/api/bundles", {
				items: selectedIds,
				bundlePrice: Number(bundlePrice),
			});
			if (data.success) {
				toast.success("Bundle created");
				setSelectedIds([]);
				setBundlePrice("");
				setBundleMode(false);
				router.push(`/bundles/${data.data._id}`);
			} else {
				toast.error(data.msg);
			}
		} catch (err) {
			toast.error(err.response?.data?.msg || "Could not create bundle");
		}
	};

	return (
		<>
			<Navbar focusOn={"sell"} />
			<div className="flex flex-col min-h-80vh">
				<div className=" my-4 mx-4 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
					<h1 className="mx-10 text-3xl text-center text-blue-600 font-semibold">
						Your items for sell
					</h1>
					<div className="flex flex-row gap-2">
						<button
							onClick={() => {
								setBundleMode(!bundleMode);
								setSelectedIds([]);
							}}
							className="px-4 py-2 uppercase font-semibold border-[1px] border-blue-500 text-blue-500 hover:bg-blue-50 rounded-sm"
						>
							{bundleMode ? "Cancel bundling" : "Create a bundle"}
						</button>
						<Link href="/additem">
							<button className="w-44 flex flex-row items-center justify-center gap-3 text-xl uppercase bg-blue-500 text-white  hover:bg-blue-400 fond-semibold px-4 py-2 rounded-sm">
								<AiOutlinePlusCircle size={24} /> Add item
							</button>
						</Link>
					</div>
				</div>

				{bundleMode && (
					<div className="mx-10 mb-4 flex flex-row items-center gap-3">
						<input
							type="number"
							placeholder="Bundle price"
							value={bundlePrice}
							onChange={(e) => setBundlePrice(e.target.value)}
							className="outline-none px-4 py-1 border-[1px] border-black w-40"
						/>
						<button
							onClick={handleCreateBundle}
							className="px-4 py-2 uppercase font-semibold bg-green-600 text-white hover:bg-green-500 rounded-sm"
						>
							Create bundle from selected ({selectedIds.length})
						</button>
					</div>
				)}

				{sellingProducts && sellingProducts.length > 0 ? (
					sellingProducts.map((product) => {
						return (
							<div key={product._id} className="flex flex-row items-center">
								{bundleMode && !product.bundledIn && (
									<input
										type="checkbox"
										checked={selectedIds.includes(product._id)}
										onChange={() => toggleSelected(product._id)}
										className="ml-4 w-5 h-5"
									/>
								)}
								{bundleMode && product.bundledIn && (
									<span className="ml-4 text-sm text-gray-500">bundled</span>
								)}
								<div className="flex-1">
									<SellingProductCard {...product} />
								</div>
							</div>
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
