import AchievementIcon from "./icons/Achievement"
import AppleIcon from "./icons/Apple"
import BackArrowIcon from "./icons/BackArrow"
import CalendarIcon from "./icons/Calendar"
import EditIcon from "./icons/Edit"
import GoogleIcon from "./icons/Google"
import KidArrowIcon from "./icons/KidArrow"
import LinkIcon from "./icons/Link"
import ProgressIcon from "./icons/Progress"
import QuizInfoIcon from "./icons/QuizInfo"
import BasicInfoIcon from "./icons/settings/BasicInfo"
import BellIcon from "./icons/settings/BellIcon"
import ChangePinIcon from "./icons/settings/changePin"
import GetHelpIcon from "./icons/settings/GetHelp"
import KidFace from "./icons/settings/KidFace"
import LockIcon from "./icons/settings/Lock"
import TermsIcon from "./icons/settings/Terms"
import TransactionRecieveIcon from "./icons/settings/wallet/TransactionRecieve"
import TransactionSend from "./icons/settings/wallet/TransactionSend"
import UserCircle from "./icons/settings/User-Circle"
import UserAvatarIcon from "./icons/settings/UserAvatar"
import ArrowIcon from "./icons/splash/ArrowIcon"
import KidIcon from "./icons/splash/KidIcon"
import ParentIcon from "./icons/splash/Parent"
import ExploreIcon from "./icons/tab-bar/Explore"
import HomeIcon from "./icons/tab-bar/Home"
import RewardIcon from "./icons/tab-bar/Reward"
import SettingIcon from "./icons/tab-bar/Setting"
import TaskIcon from "./icons/tab-bar/Task"
import KidCardIcon from "./images/kid/KidCard"
import LinkedParentIcon from "./images/kid/LinkedParent"
import UploadIcon from "./icons/settings/wallet/Upload"
import DownloadIcon from "./icons/settings/wallet/Download"
import TransferIcon from "./icons/settings/wallet/Transfer"
import WalletIcon from "./icons/settings/Wallet"

export const IMAGES = {
    ob_p_1: require("./images/ob-p-1.png"),
    ob_p_2: require("./images/ob-p-2.png"),
    ob_p_3: require("./images/ob-p-3.png"),
    ob_k_1: require("./images/ob-k-1.png"),
    ob_k_2: require("./images/ob-k-2.png"),
    ob_k_3: require("./images/ob-k-3.png"),
    role: require("./images/role.png"),
    bhalu: require("./images/bhalu.png"),
    img_bg: require("./images/imgbg.png"),
    reward: require("./images/reward.png"),
    profile: require("./images/profile.png"),
    explore: require("./images/explore.png"),
    splash_img: require("./images/splash-image.png"),
    upload_profile: require("./images/upload-profile.png"),
}


export const ICONS = {
    SPLASH:{
        arrow: <ArrowIcon />,
        kid: <KidIcon />,
        parent: <ParentIcon />
    },
    TAB_BAR: {
        home: <HomeIcon />,
        rewards: <RewardIcon />,
        settings: <SettingIcon />,
        task: <TaskIcon />,
        explore: <ExploreIcon />
    },
    apple: <AppleIcon />,
    google: <GoogleIcon />,
    back_arrow: <BackArrowIcon />,
    edit: <EditIcon />,
    SETTINGS: {
        WALLET: {
            send: <TransactionSend />,
            recieve: <TransactionRecieveIcon />,
            upload: <UploadIcon />,
            download: <DownloadIcon />,
            transfer: <TransferIcon />,
        },
        wallet: <WalletIcon />,
        bell: <BellIcon />,
        get_help: <GetHelpIcon />,
        kid_face: <KidFace />,
        lock: <LockIcon />,
        user: <TermsIcon />,
        terms: <UserCircle />,
        user_avatar: <UserAvatarIcon />
    },
    progress: <ProgressIcon />,
    link: <LinkIcon />,
    achievement : <AchievementIcon height={40} width={40} />,
    basicInfo : <BasicInfoIcon />,
    changePin : <ChangePinIcon />,
    calendar : <CalendarIcon />,
    quizInfo: <QuizInfoIcon />,

    linkedParent: <LinkedParentIcon />,
    kidCard: <KidCardIcon />,
    kidArrow: <KidArrowIcon />
}

