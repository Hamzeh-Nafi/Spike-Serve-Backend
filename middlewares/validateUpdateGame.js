export function validateUpdateGame(req, res, next) {
    const updateList = req.body;
    const updateListKeys = Object.keys(updateList);

    if (updateListKeys.length == 0) {
        return res.status(400).send("No fields were sent through the request !");
    }
    const whiteListKeys = [
            "name_eng",
            "name_arb",
            "status",
            "day_date",
            "start_hour",
            "end_hour",
            "location_link",
            "player_spot_availability",
            "player_spot_reserved",
            "week_recurring"

        ]
        // I need to study this !
    const validUpdates = updateListKeys.filter(key =>
        whiteListKeys.includes(key)
    );

    if (validUpdates.length === 0) {
        return res.status(400).send("Invalid fields !");
    }

    const sqlUpdates = []
    let counter = 1;

    validUpdates.forEach(key => {
        const update = `${key} = $${counter}`
        sqlUpdates.push(update)
        counter++;
    });

    req.sqlUpdatesCode = sqlUpdates.join(", ");

    const sqlValues = [];

    validUpdates.forEach(updateKey => {
        sqlValues.push(updateList[updateKey]);
    });

    req.sqlValues = sqlValues;

    next();

}