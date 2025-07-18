import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex  rounded-2xl overflow-hidden p-12 bg-gradient-to-br from-blue-400 to-purple-600 w-full h-auto ">
                <AppLogoIcon className="w-full h-auto  rounded-2xl overflow-hidden object-contain   text-white dark:text-black" />
            </div>
          
        </>
    );
}
