import { useLanguage } from "../contexts/LanguageContext";
const {
  language,
  translations: currentLanguage,
  changeLanguage,
} = useLanguage();
const Loader = () => <div>{currentLanguage.loading}...</div>;
export default Loader;
