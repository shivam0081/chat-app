import { animationDefaultOption } from "@/lib/utils";
import Lottie2 from "react-lottie";
import { Link } from "react-router-dom";

const EmptyChatLayout = () => {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex flex-col justify-center items-center md:border-l md:border-white/5">
      <Link to={"https://github.com/shivam0081"} target="_blank">
        <Lottie2
          isClickToPauseDisabled={true}
          height={200}
          width={200}
          options={animationDefaultOption}
        />
      </Link>

      <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-10 lg:text-3xl text-2xl transition-all duration-300 text-center">
        <h3 className=" poppins-medium">
          Welcome to
          <span className="text-purple-500"> Syncronus</span> Chat App
        </h3>
        <small className="text-[0.75rem]">
          Copyright <span className="text-purple-500">&copy;</span> 2024.
          Created by{" "}
          <Link
            className="text-purple-500 underline"
            to={"https://github.com/shivam0081"}
            target="_blank"
          >
            Shivam Bhatia
          </Link>
        </small>
      </div>
    </div>
  );
};

export default EmptyChatLayout;
