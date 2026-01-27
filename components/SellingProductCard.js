import Image from "next/image";
import bookImg from "../public/book.jpg";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import Link from "next/link";

const SellingProductCard = ({
	_id,
	name,
	counts,
	price,
	description,
	categories,
	productImages,
	seller,
}) => {
	return (
		<Link href={`/seller/${seller}/product/${_id}`}>
			<div className="mx-4 my-2 flex flex-col w-full md:flex-row gap-4 md:gap-10 border-b-gray-400 border-b-[1px] shadow-md px-5 py-4">
				<div className="md:w-1/2 lg:w-1/3 lg:h-[50vh]">
					{productImages.length > 0 && (
						<Image
							src={productImages[0]}
							width={400}
							height={400}
							alt="product image"
							className="w-full lg:h-[50vh] object-contain object-center"
						/>
					)}
				</div>

				<div className="md:w-1/2 flex flex-row justify-between mt-1">
					<div className="flex flex-col ">
						<span className="uppercase font-semibold">{name}</span>
						<p>
							<span className="font-semibold">Availabe :</span> {counts}
						</p>
						<p>
							<span className="font-semibold">Price : </span>₹{price}
						</p>
						<span>
							{description?.substring(0, 300)}{" "}
							{description?.length > 300 ? "..." : ""}
						</span>
						<Link href={`/seller/${seller}/product/${_id}`}>
							<button className="w-52 mt-4 px-4 py-2 uppercase font-semibold bg-blue-500 text-white  hover:bg-blue-400 transition-all duration-500 rounded-2 ">
								<span className="uppercase ">Edit item</span>
							</button>
						</Link>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default SellingProductCard;
