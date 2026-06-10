import { Link, useNavigate } from 'react-router-dom'
import { clearAdminToken } from '../utils/auth'

const Home = () => {
     const navigate = useNavigate();

     const logout = () => {
          clearAdminToken();
          navigate('/login', { replace: true });
     };

     return (
          <div className='flex items-center justify-center flex-col min-h-screen gap-4 text-white py-10'>
               <button onClick={logout} className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100 cursor-pointer'>
                    Logout
               </button>
               <Link to="/hero" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Hero</Link>
               <Link to="/blogs" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Blogs</Link>
               <Link to="/h1" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>H1</Link>
               <Link to="/h2" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>H2</Link>
               <Link to="/h3" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>H3</Link>
               <Link to="/faq" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Faq</Link>
               <Link to="/site-meta" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Site Meta</Link>
               <Link to="/about" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>About</Link>
               <Link to="/location" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Location</Link>
               <Link to="/service" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Service</Link>
               <Link to="/footer" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Footer</Link>
               <Link to="/testimonials" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Testimonials</Link>
               <Link to="/navbar" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Navbar</Link>
               <Link to="/navigations" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Navigations</Link>
               <Link to="/company-worked" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Company Worked</Link>
               <Link to="/portfolios" className='bg-orange-600 px-10 py-3 rounded-2xl text-center w-100'>Portfolios</Link>
          </div>
     )
}

export default Home
