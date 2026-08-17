import BottomNav from './BottomNav'

const PageWrapper = ({ children, hideNav = false, className = '' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#111111]">
      <div className="flex-1 flex flex-col items-center w-full">
        <main className={`flex-1 w-full md:max-w-2xl lg:max-w-4xl mx-auto flex flex-col overflow-y-auto ${hideNav ? '' : 'pb-20'} ${className}`}>
          {children}
        </main>
      </div>
      {!hideNav && <BottomNav />}
    </div>
  )
}

export default PageWrapper
