import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axiosInstance from "../axios/axios-instance";
import ProductCard from "../components/ProductCard";
import { CAMPUS_BUILDINGS } from "../constants/campusBuildings";

const Nearby = () => {
	const [buildingId, setBuildingId] = useState("");
	const [products, setProducts] = useState([]);

	useEffect(() => {
		axiosInstance
			.get("/api/auth/me")
			.then(({ data }) => {
				if (data.data?.dormBuildingId) {
					setBuildingId(data.data.dormBuildingId);
				}
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!buildingId) return;
		axiosInstance
			.get(`/api/products/nearby-building?buildingId=${buildingId}`)
			.then(({ data }) => setProducts(data.data || []))
			.catch(() => setProducts([]));
	}, [buildingId]);

	return (
		<>
			<Navbar focusOn={"nearby"} />
			<div className="mx-4 md:mx-24 mt-6">
				<h1 className="text-3xl font-bold text-blue-500 mb-4">Items near my dorm</h1>
				<select
					value={buildingId}
					onChange={(e) => setBuildingId(e.target.value)}
					className="outline-none px-4 py-2 border-[1px] border-black w-64"
				>
					<option value="">Select a building...</option>
					{CAMPUS_BUILDINGS.map((building) => (
						<option key={building.id} value={building.id}>
							{building.name}
						</option>
					))}
				</select>
				<div className="md:flex md:flex-row justify-center flex-wrap mt-6">
					{products.map((product) => (
						<ProductCard {...product} key={product._id} />
					))}
					{buildingId && products.length === 0 && (
						<p className="mt-4">No items listed there right now.</p>
					)}
				</div>
			</div>
			<Footer />
		</>
	);
};

export default Nearby;
