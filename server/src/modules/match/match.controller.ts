import * as matchService from "./match.services"

export async function matchMaker(req:any, res:any) {
    const matches = await matchService.autoMatchmaker(req.params.id);
    res.status(200).json(matches);
}
export async function getPotentials(req:any, res:any) {
    const potentials = await matchService.getPotentials(req.params.id)
    res.status(200).json(potentials);
}
export async function getAllUsersPotentials(req:any, res:any) {
    const potentials = await matchService.getAllUsersPotentials()
    res.status(200).json(potentials);
}