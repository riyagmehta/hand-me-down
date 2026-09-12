import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosInstance from "../axios/axios-instance";
import verifyJWT from "../lib/verifyJWT";
import { getCookie } from "cookies-next";
import { ToastContainer, toast } from "react-toastify";

const OrderRow = ({ order, myUid, onCancel }) => {
	const isBuyer = order.buyer?._id === myUid;

	return (
		<div className="mx-4 my-2 flex flex-col md:flex-row md:justify-between md:items-center gap-2 border-b-gray-400 border-b-[1px] shadow-md px-5 py-4">
			<div className="flex flex-col">
				<span className="uppercase font-semibold">{order.product?.name}</span>
				<p>
					<span className="font-semibold">{isBuyer ? "Bought from" : "Sold to"} : </span>
					{isBuyer ? order.seller?.firstName : order.buyer?.firstName}
				</p>
				<p>
					<span className="font-semibold">Quantity : </span>
					{order.quantity}
				</p>
				<p>
					<span className="font-semibold">Total : </span>₹{order.totalPrice}
				</p>
				<p>
					<span className="font-semibold">Status : </span>
					{order.status}
				</p>
			</div>
			{order.status === "placed" && (
				<button
					type="button"
					onClick={() => onCancel(order._id)}
					className="w-40 h-fit px-4 py-2 uppercase font-semibold bg-red-500 text-white hover:bg-red-400 transition-all duration-500 rounded-2"
				>
					Cancel order
				</button>
			)}
		</div>
	);
};

const Orders = (props) => {
	const [orders, setOrders] = useState(props.orders);

	const handleCancel = async (orderId) => {
		try {
			const { data } = await axiosInstance.put(`/api/orders/${orderId}/cancel`);
			if (data.success === true) {
				toast.success("Order cancelled");
				setOrders((prev) =>
					prev.map((order) => (order._id === orderId ? data.data : order))
				);
			}
		} catch (err) {
			toast.error(err.response?.data?.msg || "Could not cancel order");
		}
	};

	return (
		<>
			<Navbar focusOn={"orders"} />
			<div className="flex flex-col md:mx-24 min-h-screen">
				<h1 className="my-4 mx-4 text-3xl uppercase text-blue-500 font-semibold">
					Your orders
				</h1>
				{orders.length > 0 ? (
					orders.map((order) => (
						<OrderRow
							key={order._id}
							order={order}
							myUid={props.uid}
							onCancel={handleCancel}
						/>
					))
				) : (
					<p className="mx-4">No orders yet.</p>
				)}
			</div>
			<Footer />
			<ToastContainer position="bottom-right" hideProgressBar theme="dark" />
		</>
	);
};

export default Orders;

export async function getServerSideProps({ req, res }) {
	const token = getCookie("token", { req, res });
	const decodedToken = verifyJWT(token);
	if (!decodedToken) {
		return {
			redirect: {
				destination: "/login",
			},
		};
	}

	const { uid } = decodedToken;
	const { data } = await axiosInstance.get(`/api/orders`, {
		headers: { cookie: req.headers.cookie },
	});

	return {
		props: { orders: data.data, uid },
	};
}
