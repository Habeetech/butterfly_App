import * as matchService from "./match.services"

export async function matchMaker(req, res) {
    const matches = await matchService.autoMatchmaker(req.params.id);
    res.status(200).json(matches);
}