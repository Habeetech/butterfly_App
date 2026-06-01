import * as discoverServices from "./discover.services.js"

export async function discoverProfiles(req:any, res:any) {
    const nearbyUser = await discoverServices.discoverProfiles(req.params.userId);
    res.status(200).json(nearbyUser);
}