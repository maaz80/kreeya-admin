import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import Home from "./pages/Home"
import Navigation from "./pages/Navigation"
import CompanyWorked from "./pages/CompanyWorked"
import Faq from "./pages/Faq"
import Blogs from "./pages/Blogs"
import Services from "./pages/Service"
import AdminTestimonials from "./pages/Testimonials"
import About from "./pages/About"
import FooterManager from "./pages/Footer"
import HeroManager from "./pages/HeroManager"
import OpeningVideoManager from "./pages/OpeningVideoManager"
import NavbarManager from "./pages/Navbar"
import H2Manager from "./pages/H2Manager"
import H1Manager from "./pages/H1Manager"
import H3Manager from "./pages/H3Manager"
import PageSEOManager from "./pages/PageSEOManager"
import Login from "./pages/Login"
// import LocationHeroAdmin from "./pages/LocationHero"
// import LocationPageAdmin from "./pages/LocationPage"
// import ServiceHeroAdmin from "./pages/ServiceHero"
// import ServicePageAdmin from "./pages/ServicePage"
import Locations from "./pages/Location"
import Portfolios from "./pages/Portfolios"

const protectedPage = (page) => (
  <ProtectedRoute>
    {page}
  </ProtectedRoute>
)

const App = () => {
  return (
    <div className="poppins-regular">
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/' element={protectedPage(<Home />)} />
        <Route path='/hero' element={protectedPage(<HeroManager />)} />
        <Route path='/opening-video' element={protectedPage(<OpeningVideoManager />)} />
        <Route path='/faq' element={protectedPage(<Faq />)} />
        <Route path='/blogs' element={protectedPage(<Blogs />)} />
        <Route path='/service' element={protectedPage(<Services />)} />
        <Route path='/location' element={protectedPage(<Locations />)} />
        <Route path='/about' element={protectedPage(<About />)} />
        <Route path='/h1' element={protectedPage(<H1Manager />)} />
        <Route path='/h2' element={protectedPage(<H2Manager />)} />
        <Route path='/h3' element={protectedPage(<H3Manager />)} />
        <Route path='/site-meta' element={protectedPage(<PageSEOManager />)} />
        <Route path='/footer' element={protectedPage(<FooterManager />)} />
        <Route path='/testimonials' element={protectedPage(<AdminTestimonials />)} />
        <Route path='/navbar' element={protectedPage(<NavbarManager />)} />
        <Route path='/navigations' element={protectedPage(<Navigation />)} />
        <Route path='/company-worked' element={protectedPage(<CompanyWorked />)} />
        <Route path='/portfolios' element={protectedPage(<Portfolios />)} />
        {/* <Route path='/location-hero' element={protectedPage(<LocationHeroAdmin />)} />
        <Route path='/location-page' element={protectedPage(<LocationPageAdmin />)} /> */}
        {/* <Route path="/service/:serviceId/item/:itemId/hero" element={<ServiceHeroAdmin />} />
        <Route path="/service/:serviceId/item/:itemId/page" element={<ServicePageAdmin />} /> */}
      </Routes>
    </div>
  )
}

export default App
