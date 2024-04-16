import { useAuth } from "@/hooks/useAuth";
import { HeadTitle } from "@components/helpers/head/title";
import { Logo } from "@components/ui/Logo";
import Link from "next/link";

/* eslint-disable @next/next/no-img-element */
export default function Windows() {
  const { user } = useAuth();
  return (
    <>
      <HeadTitle title="OpenGeoOS" disableTemplate />
      <div
        className="flex flex-col w-full z-[100] absolute top-0 left-0 min-h-screen font-sans text-white bg-center bg-no-repeat bg-cover select-none"
        style={{ backgroundImage: 'url("https://i.redd.it/75o10902ql571.jpg")' }}
      >
        <div className="absolute top-0 left-0  z-[100] w-screen h-screen bg-black bg-opacity-50 " />
        <div className="flex flex-1 p-6  z-[101]">
          <div className="flex flex-col items-center gap-y-1.5">
            <img
              className="w-8 h-auto"
              src="https://tailwindcollections-windows-11.netlify.app/img/recycle-bin.png"
              alt=""
            />
            <span className="text-xs">Recycle Bin</span>
          </div>
        </div>
        <div className="absolute w-[600px] z-[101] flex flex-col bottom-16 right-1/2 translate-x-1/2">
          <div className="flex flex-col p-8 border rounded-t gap-y-6 border-white/10 bg-purple bg-opacity-65 backdrop-filter backdrop-blur-2xl">
            <div className="flex items-center w-full h-10 overflow-hidden bg-white rounded-sm shadow-search">
              <div className="p-5 pr-4">
                <svg width={17} height={17} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9.563 13.813a6.375 6.375 0 1 1 0-12.75 6.375 6.375 0 0 1 0 12.75ZM4.781 12.219l-3.718 3.718"
                    stroke="#8A8A8A"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                className="w-full h-full pb-0.5 text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none appearance-none bg-transparent border-none"
                type="text"
                placeholder="Type here to"
              />
            </div>
            <div className="flex flex-col gap-y-3">
              <div className="flex justify-between">
                <span className="font-bold text-white">Pinned</span>
                <button className="flex items-center px-4 py-1 space-x-2 bg-gray-200 rounded-md bg-opacity-10">
                  <span className="pb-0.5 text-xs">All apps</span>
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.874 7.767a.429.429 0 0 1 0 .607l-5.142 5.142a.43.43 0 0 1-.606-.607l4.839-4.838-4.84-4.839a.429.429 0 1 1 .607-.606l5.142 5.141Z"
                      fill="#F3F3F3"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-6 -mx-5">
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/word.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Word</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/excel.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Excel</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/power-point.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Powerpoint</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/calendar.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Calendar</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/settings.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Settings</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/store-dark.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Microsoft Store</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/epic-games.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Epic Games</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/spotify.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Spotify</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/newsfeed.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">News</span>
                </div>

                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/solitaire.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Solitaire</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/onedrive.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Onedrive</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/netflix.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Netflix</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/todo.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Todo</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/office.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Office</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/twitter.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Twitter</span>
                </div>
                <div className="flex flex-col items-center justify-center w-24 h-20 text-center">
                  <img
                    className="w-auto h-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/skype.png"
                    alt=""
                  />
                  <span className="pt-2 text-xs cursor-pointer whitespace-nowrap">Skype</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-y-3">
              <div className="flex justify-between">
                <span className="font-bold text-white">Recommended</span>
                <button className="flex items-center px-4 py-1 space-x-2 bg-gray-200 rounded-md bg-opacity-10">
                  <span className="text-xs pb-0.5">More</span>
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10.874 7.767a.429.429 0 0 1 0 .607l-5.142 5.142a.43.43 0 0 1-.606-.607l4.839-4.838-4.84-4.839a.429.429 0 1 1 .607-.606l5.142 5.141Z"
                      fill="#F3F3F3"
                    />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <Link href="/" className="flex items-center px-2">
                  <img
                    className="w-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/get-started.png"
                    alt=""
                  />
                  <div className="flex flex-col pl-4">
                    <span className="text-xs font-bold leading-relaxed tracking-wide cursor-pointer">Get Started</span>
                    <span className="text-xs cursor-pointer">Welcome to OpenGeo</span>
                  </div>
                </Link>
                <div className="flex items-center px-2">
                  <img
                    className="w-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/recently-added.png"
                    alt=""
                  />
                  <div className="flex flex-col pl-4">
                    <span className="text-xs font-bold leading-relaxed tracking-wide cursor-pointer">One Drive</span>
                    <span className="text-xs cursor-pointer">Recently added</span>
                  </div>
                </div>
                <div className="flex items-center px-2">
                  <img
                    className="w-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/image.png"
                    alt=""
                  />
                  <div className="flex flex-col pl-4">
                    <span className="text-xs font-bold leading-relaxed tracking-wide cursor-pointer">Luicile</span>
                    <span className="text-xs cursor-pointer">Yesterday at 4:20 PM</span>
                  </div>
                </div>
                <div className="flex items-center px-2">
                  <img
                    className="w-8 cursor-pointer"
                    src="https://tailwindcollections-windows-11.netlify.app/img/image.png"
                    alt=""
                  />
                  <div className="flex flex-col pl-4">
                    <span className="text-xs font-bold leading-relaxed tracking-wide cursor-pointer">Yoshentin</span>
                    <span className="text-xs cursor-pointer">12h ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between h-16 px-10 bg-purple bg-opacity-65 backdrop-filter backdrop-blur-[57px] border-b border-l border-r border-white/10 rounded-b-md">
            <button className="flex items-center">
              <img className="w-8 h-8" src="https://tailwindcollections-windows-11.netlify.app/img/avatar.png" alt="" />
              <span className="pl-4 text-sm">{user?.cn}</span>
            </button>
            <div className="flex items-center">
              <button className="flex items-center justify-center w-10 h-10">
                <svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.695 12.79c-.182 0-.362.033-.539.1-.177.068-.354.141-.531.22a9.246 9.246 0 0 1-.523.218 1.499 1.499 0 0 1-.54.102.98.98 0 0 1-.43-.094 1.196 1.196 0 0 1-.35-.281 4.546 4.546 0 0 1-.243-.313 15.745 15.745 0 0 1-.578-.922 9.742 9.742 0 0 1-.266-.508 4.983 4.983 0 0 1-.18-.468 1.244 1.244 0 0 1-.07-.367c0-.188.047-.355.14-.5.095-.151.21-.287.345-.407.14-.125.291-.242.453-.351.166-.11.318-.224.453-.344.14-.125.258-.255.351-.39A.853.853 0 0 0 2.329 8a.84.84 0 0 0-.14-.477c-.094-.14-.211-.27-.352-.39a5.285 5.285 0 0 0-.453-.36 5.286 5.286 0 0 1-.453-.359A2.153 2.153 0 0 1 .578 6a.904.904 0 0 1-.14-.5c0-.094.023-.214.07-.36.052-.145.117-.301.195-.468.078-.167.167-.336.266-.508a10.412 10.412 0 0 1 .602-.938c.093-.13.174-.231.242-.304a1.013 1.013 0 0 1 .781-.36c.182 0 .36.034.531.102.172.068.344.143.516.227.171.078.343.15.515.218.177.068.357.102.54.102.234 0 .434-.07.6-.211a.934.934 0 0 0 .321-.563l.14-.765c.048-.255.095-.51.141-.766A.982.982 0 0 1 6.18.367c.15-.14.336-.232.554-.273.209-.037.42-.06.633-.07a8.67 8.67 0 0 1 1.29 0c.218.015.434.044.648.085.218.042.398.133.539.274.14.14.232.32.273.539.047.255.091.508.133.758.042.25.086.502.133.758a.93.93 0 0 0 .32.554.901.901 0 0 0 .602.219c.182 0 .362-.034.539-.102.177-.067.351-.14.523-.218.177-.079.354-.151.531-.22.178-.067.357-.1.54-.1.161 0 .304.033.43.1.13.063.247.155.35.274.069.078.147.183.235.313.094.13.19.273.29.43.098.156.197.322.296.5.099.171.185.34.258.507.078.162.14.315.187.461.047.146.07.268.07.367a.919.919 0 0 1-.14.508 1.971 1.971 0 0 1-.351.407c-.136.12-.287.234-.454.343-.161.11-.312.227-.453.352-.135.12-.25.25-.344.39a.817.817 0 0 0-.14.477.84.84 0 0 0 .14.477c.094.14.211.273.352.398.14.12.292.237.453.352.162.114.313.237.453.367.14.125.258.26.352.406.094.146.14.313.14.5 0 .104-.025.23-.078.375-.046.14-.109.294-.187.46-.078.168-.17.337-.274.509a8.84 8.84 0 0 1-.304.492 6.16 6.16 0 0 1-.297.43c-.094.13-.175.234-.242.312a1.143 1.143 0 0 1-.352.266.914.914 0 0 1-.414.094c-.172 0-.349-.034-.531-.102-.177-.068-.354-.14-.531-.219a7.752 7.752 0 0 0-.532-.226 1.44 1.44 0 0 0-.515-.102c-.23 0-.407.047-.532.14a.919.919 0 0 0-.289.368c-.067.146-.117.31-.148.492-.026.177-.055.349-.086.516l-.078.398c-.021.125-.044.255-.07.39a.988.988 0 0 1-.282.548c-.146.135-.33.224-.554.265-.209.037-.42.063-.633.078-.209.01-.42.016-.633.016-.219 0-.438-.008-.656-.023a5.395 5.395 0 0 1-.649-.086 1.007 1.007 0 0 1-.539-.274 1.05 1.05 0 0 1-.273-.547c-.047-.25-.091-.5-.133-.75a32.777 32.777 0 0 0-.133-.758.93.93 0 0 0-.32-.554.901.901 0 0 0-.602-.219Zm4.422 2.132c.021-.115.044-.255.07-.422.027-.172.055-.346.086-.523.032-.178.066-.347.102-.508a3.22 3.22 0 0 1 .11-.39c.145-.392.38-.704.703-.938a1.852 1.852 0 0 1 1.117-.352c.14 0 .302.026.484.078.188.047.378.104.57.172.198.068.388.138.57.211.183.073.344.135.485.188.245-.292.461-.6.649-.922.187-.329.351-.667.492-1.016v-.008l-1.196-1.015A1.89 1.89 0 0 1 12.672 8c0-.286.06-.56.18-.82.125-.26.296-.482.515-.664l1.18-.985v-.008a.64.64 0 0 0-.031-.085.517.517 0 0 0-.04-.094 5.82 5.82 0 0 0-.453-.922 6.68 6.68 0 0 0-.585-.852h-.008l-1.47.532c-.207.072-.42.109-.64.109-.354 0-.68-.086-.976-.258a1.903 1.903 0 0 1-.946-1.336l-.265-1.523a6.879 6.879 0 0 0-1.695-.07c-.188.01-.373.028-.555.054-.047.26-.091.518-.133.774-.042.255-.091.51-.148.765-.047.23-.128.443-.243.64-.114.194-.255.36-.421.5-.167.141-.355.253-.563.337a1.898 1.898 0 0 1-.672.117c-.234 0-.456-.04-.664-.117h-.008l-1.437-.532h-.008c-.24.297-.456.607-.648.93A6.226 6.226 0 0 0 1.445 5.5v.008l1.196 1.015c.218.183.388.404.507.665.12.255.18.526.18.812 0 .286-.062.56-.187.82-.12.26-.29.482-.508.664l-1.18.985v.008a.813.813 0 0 0 .07.18c.125.322.274.632.446.929.177.292.375.573.593.844h.008l1.47-.532c.207-.072.42-.109.64-.109.354 0 .68.086.976.258.25.14.456.328.617.562.167.235.276.493.329.774l.265 1.523C7.242 14.97 7.62 15 8 15c.188 0 .375-.005.563-.016.187-.015.372-.036.554-.062ZM5 8c0-.417.078-.807.234-1.172a3.01 3.01 0 0 1 .641-.953c.27-.27.589-.484.953-.64A2.943 2.943 0 0 1 8 5c.417 0 .807.078 1.172.234.364.157.682.37.953.641.27.27.484.589.64.953.157.365.235.755.235 1.172 0 .417-.078.807-.234 1.172a3.01 3.01 0 0 1-.641.953 3.01 3.01 0 0 1-.953.64A2.942 2.942 0 0 1 8 11c-.417 0-.807-.078-1.172-.234a3.01 3.01 0 0 1-.953-.641 3.01 3.01 0 0 1-.64-.953A2.943 2.943 0 0 1 5 8Zm5 0a2.008 2.008 0 0 0-1.227-1.844A1.919 1.919 0 0 0 8 6a1.974 1.974 0 0 0-1.414.586 2.008 2.008 0 0 0-.43 2.195A2.033 2.033 0 0 0 7.22 9.844c.245.104.505.156.781.156s.534-.052.773-.156a2.008 2.008 0 0 0 1.07-1.063C9.949 8.536 10 8.276 10 8Z"
                    fill="#fff"
                  />
                </svg>
              </button>
              <button className="flex items-center justify-center w-10 h-10">
                <svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.5 6.5v-6a.48.48 0 0 1 .148-.352A.48.48 0 0 1 8 0a.48.48 0 0 1 .352.148A.48.48 0 0 1 8.5.5v6a.48.48 0 0 1-.148.352A.48.48 0 0 1 8 7a.48.48 0 0 1-.352-.148A.48.48 0 0 1 7.5 6.5Zm-7 2c0-.651.086-1.292.258-1.922a7.756 7.756 0 0 1 .734-1.797 7.719 7.719 0 0 1 1.164-1.554 6.826 6.826 0 0 1 1.54-1.196.492.492 0 0 1 .257-.07.48.48 0 0 1 .352.148.48.48 0 0 1 .148.352.407.407 0 0 1-.07.25.733.733 0 0 1-.18.18l-.539.367a4.36 4.36 0 0 0-.508.398 6.374 6.374 0 0 0-.898 1.008 6.93 6.93 0 0 0-.68 1.172c-.187.411-.33.838-.43 1.281-.099.443-.148.89-.148 1.344 0 .604.076 1.185.227 1.742.156.552.372 1.07.648 1.555.281.484.62.927 1.016 1.328.395.396.833.737 1.312 1.023.484.282 1.003.5 1.555.657A6.421 6.421 0 0 0 8 15c.604 0 1.182-.078 1.734-.234a6.549 6.549 0 0 0 1.555-.657 6.383 6.383 0 0 0 2.328-2.352 6.464 6.464 0 0 0 .649-1.562 6.392 6.392 0 0 0 .086-3.078 6.504 6.504 0 0 0-.43-1.281 6.932 6.932 0 0 0-.68-1.172 6.374 6.374 0 0 0-.898-1.008 4.027 4.027 0 0 0-.516-.398l-.531-.367a.887.887 0 0 1-.188-.18.444.444 0 0 1-.062-.25.48.48 0 0 1 .148-.352.48.48 0 0 1 .352-.148c.094 0 .18.023.258.07a6.67 6.67 0 0 1 1.53 1.196c.46.468.847.987 1.165 1.554a7.557 7.557 0 0 1 1 3.719c0 .688-.091 1.352-.273 1.992a7.453 7.453 0 0 1-.758 1.79 7.379 7.379 0 0 1-1.172 1.523 7.558 7.558 0 0 1-1.516 1.172 7.856 7.856 0 0 1-1.797.757A7.357 7.357 0 0 1 8 16c-.693 0-1.36-.088-2-.266a7.897 7.897 0 0 1-1.79-.757 7.864 7.864 0 0 1-1.515-1.172 7.862 7.862 0 0 1-1.172-1.516 7.858 7.858 0 0 1-.757-1.797A7.443 7.443 0 0 1 .5 8.5Z"
                    fill="#fff"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 z-[101] inset-x-0 h-14 flex items-center justify-center gap-x-3 bg-purple bg-opacity-[.63] backdrop-filter backdrop-blur-[50px]">
          <div>
            <button className="p-2 rounded relative bg-white bg-opacity-[0.16] border border-white/10 shadow-md">
              <Logo className="w-auto h-6" />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/search.png"
                alt=""
              />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/screen.png"
                alt=""
              />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/dashboard.png"
                alt=""
              />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/explorer.png"
                alt=""
              />
              <span className="absolute h-0.5 w-1 rounded-full bg-white -bottom-0.5 left-1/2 -translate-x-1/2" />
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/edge.png"
                alt=""
              />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/word.png"
                alt=""
              />
              <span className="absolute h-0.5 w-1 rounded-full bg-white -bottom-0.5 left-1/2 -translate-x-1/2" />
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/power-point.png"
                alt=""
              />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/store.png"
                alt=""
              />
              {/**/}
            </button>
          </div>
          <div>
            <button className="relative p-2 rounded">
              <img
                className="w-auto h-6"
                src="https://tailwindcollections-windows-11.netlify.app/img/steam.png"
                alt=""
              />
              <span className="absolute h-0.5 w-1 rounded-full bg-white -bottom-0.5 left-1/2 -translate-x-1/2" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
