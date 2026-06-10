import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineHome, HiOutlineArrowLeft } from "react-icons/hi";

const Breadcrumb = () => {

     const location = useLocation();
     const navigate = useNavigate();

     const pathnames = location.pathname.split("/").filter((x) => x);

     const filteredPathnames =
          pathnames[0] === "location" && pathnames.length >= 3
               ? [pathnames[pathnames.length - 1]]
               : pathnames;
     const isFaq = location.pathname.includes("/faq");
     return (
          <div className="flex items-center gap-2 flex-nowrap overflow-hidden text-sm w-full left-0 z-999 plus-jakarta-sans h-6 md:h-8 px-3 md:px-5 lg:px-10 text-[10px] md:text-[12px] lg:text-[20px] mt-3 text-dark-black">

               {/* Back Button */}
               <button
                    onClick={() => navigate("/")}
                    className={`flex items-center pr-5 gap-1 text-4xl ${isFaq ? 'text-white' : 'text-black'} hover:text-black transition cursor-pointer hover:bg-gray-200`}
               >
                    <HiOutlineArrowLeft />
               </button>

               {/* Home */}
               <Link
                    to="/"
                    className={`flex items-center gap-1  ${isFaq ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-black'}`}
               >
                    <HiOutlineHome />
                    Home
               </Link>

               {filteredPathnames.map((name, index) => {

                    const routeTo = "/" + filteredPathnames.slice(0, index + 1).join("/");
                    const isLast = index === filteredPathnames.length - 1;

                    const label = name
                         .replace(/[-_]/g, " ")
                         .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                         <div key={routeTo} className="flex items-center gap-1 md:gap-2">

                              <span className={isFaq ? 'text-white' : 'text-black'}>/</span>

                              {isLast ? (
                                   <span className={`${isFaq ? 'text-white':'text-black'} truncate max-w-30 md:max-w-100 lg:max-w-125`}>
                                        {label}
                                   </span>
                              ) : (
                                   <Link
                                        to={routeTo}
                                        className={`${isFaq ? 'text-white hover:text-orange-500' : 'text-dark-gray hover:text-black'} truncate max-w-30 md:max-w-100 lg:max-w-125`}
                                   >
                                        {label}
                                   </Link>
                              )}

                         </div>
                    );
               })}

          </div>
     );
};

export default Breadcrumb;