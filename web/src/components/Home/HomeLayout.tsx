import { Outlet } from 'react-router-dom'
import RamSidebar from './RamSidebar'

const HomeLayout = () => {
  return (
    <div className='w-screen h-screen p-3 relative overflow-x-clip'>
        <RamSidebar/>
        <Outlet/>
    </div>
  )
}

export default HomeLayout