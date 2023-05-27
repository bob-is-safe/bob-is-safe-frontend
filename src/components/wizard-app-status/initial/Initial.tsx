import Payment from './Payment'
import ModuleInstall from './ModuleInstall'

const Initial = ({ isModuleEnabled }: any) => {
  return isModuleEnabled ? <Payment/>: <ModuleInstall/>
}

export default Initial
