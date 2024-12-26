import { useNavigate } from "react-router-dom";

const Appbar = ({ name }) => {
  const navigate = useNavigate();
  return (
    <div className="shadow h-14 flex justify-between">
      <div
        onClick={() => {
          navigate("/dashboard");
        }}
        className="flex flex-col justify-center h-full ml-4 cursor-pointer text-3xl text-blue-600 font-bold"
      >
        PayTM
      </div>
      <div className="flex">
        <div className="flex flex-col justify-center h-full mr-4 text-xl font-semibold">
          {name}
        </div>
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
            {name ? name[0].toUpperCase() : "Guest"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appbar;
