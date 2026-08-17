import BottomNav from './BottomNav'

const PageWrapper = ({ children, hideNav = false, className = '' }) => {
  return (
    <div className={`min-h-screen flex flex-col bg-[#111111] ${className}`}>
      <main className={`flex-1 overflow-y-auto ${hideNav ? '' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default PageWrapper
