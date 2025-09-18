import { ErrorMessage } from "@hookform/error-message";

const getDefaultValue = (type) => {
	if (type === "number") return 0;
	return "";
};

const FormInputField = ({
	title,
	name,
	errors,
	register,
	type,
	isRequired,
}) => {
	return (
		<div className="flex  flex-col gap-1 w-full ">
			<span className=" font-semibold">
				{title} {isRequired === true ? " *" : ""}
			</span>
			<ErrorMessage
				errors={errors}
				name={name}
				render={({ message }) => (
					<span className="text-red-700 text-[12px]">{message}</span>
				)}
			/>
			<input
				type={type || "text"}
				defaultValue={getDefaultValue(type)}
				{...register(
					name,
					isRequired === true
						? {
								minLength: 1,
								required: `${title} is required`,
						  }
						: {}
				)}
				className="outline-none px-4 py-1 border-[1px] border-black "
			/>
		</div>
	);
};

export default FormInputField;
