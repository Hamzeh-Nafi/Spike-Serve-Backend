export function validateCreateGame(req, res, next) {
    const {
        name_eng,
        name_arb,
        status,
        day_date,
        start_hour,
        end_hour,
        location_link,
        player_spot_availability,
        player_spot_reserved,
        week_recurring
    } = req.body;

    if (
        name_eng === undefined ||
        name_arb === undefined ||
        status === undefined ||
        day_date === undefined ||
        start_hour === undefined ||
        end_hour === undefined ||
        location_link === undefined ||
        player_spot_availability === undefined ||
        player_spot_reserved === undefined ||
        week_recurring === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }
    next();
};