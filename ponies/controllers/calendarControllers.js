import ScheduledEvent from '../models/scheduled_event.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getScheduledEvents = asyncHandler(async (req, res, next) => {

    const { start, end } = req.query; // Ensure these are ISO strings or Date objects

    const explanation = await ScheduledEvent.find({
    'details.event.Event-Start': { $gte: start, $lte: end }
    })
    .sort({ 'details.event.Event-Start': 1 })
    .explain('executionStats');
    console.log(`explanation:  ${JSON.stringify(explanation.queryPlanner.winningPlan)}`);

    const scheduledEvents = await ScheduledEvent.find({
        'details.event.Event-Start': {
        $gte: new Date(start),
        $lte: new Date(end)
        }
    })
    .sort({ 'details.event.Event-Start': 1 }); // 1 for ascending, -1 for descending

    console.log(`mongodb returned event for start date: ${JSON.stringify(scheduledEvents)}`)
    res.setHeader('Content-Type', 'application/json');
    res.send(scheduledEvents);

});


