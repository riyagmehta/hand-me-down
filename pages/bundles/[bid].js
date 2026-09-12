import React from "react";
import axiosInstance from "../../axios/axios-instance";
import Navbar from "../../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";

const BundleView = ({ bundle }) => {
	const router = useRouter();

	const handleBuyBundle = async () => {
		try {
			const idempotencyKey = window.crypto.randomUUID();
			const { data } = await axiosInstance.post("/api/bundles/purchase", {
				bundleId: bundle._id,
				idempotencyKey,
			});
			if (data.success) {
				toast.success("Bundle purchased!");
			}
		} catch (err) {
			if (err.response?.status === 401) {
				router.push("/login");
				return;
			}
			toast.error(err.response?.data?.msg || "Could not purchase bundle");
		}
	};

	return (
		<>
			<Navbar />
			<div className="mx-4 md:mx-24 mt-6">
				<h1 className="text-3xl font-bold text-blue-500">Bundle deal</h1>
				<p className="mt-2">
					<span className="font-semibold">Seller: </span>
					{bundle.seller?.firstName}
				</p>
				<p>
					<span className="font-semibold">Bundle price: </span>₹{bundle.bundlePrice}
				</p>
				<p>
					<span className="font-semibold">Status: </span>
					{bundle.status}
				</p>
				<div className="mt-4">
					<p className="font-semibold">Items included:</p>
					<ul className="list-disc ml-6">
						{bundle.items.map((item) => (
							<li key={item._id}>
								{item.name} -- ₹{item.price}
							</li>
						))}
					</ul>
				</div>
				{bundle.status === "active" && (
					<button
						onClick={handleBuyBundle}
						className="mt-6 px-4 py-2 uppercase font-semibold bg-green-600 text-white hover:bg-green-500 rounded-2"
					>
						Buy this bundle
					</button>
				)}
			</div>
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default BundleView;

export async function getServerSideProps({ params }) {
	const { bid } = params;
	try {
		const { data } = await axiosInstance.get(`/api/bundles/${bid}`);
		return { props: { bundle: data.data } };
	} catch (err) {
		return { notFound: true };
	}
}
