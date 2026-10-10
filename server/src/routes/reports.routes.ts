import type { FastifyPluginAsync } from 'fastify';
import { lostReportSchema } from '@vlf/shared';
import { requireStaff } from '../auth/guard';
import { badRequest } from '../errors';
import { defaultVenueId } from '../repos/venues';
import { insertReport, listReports } from '../repos/reports';
import { runMatchingForReport } from '../services/matching/run';

const routes: FastifyPluginAsync = async (app) => {
  const ctx = app.ctx;

  /** Public. Deliberately returns only the id: never reveal whether an item matched. */
  app.post('/public/lost-reports', async (req) => {
    const input = lostReportSchema.parse(req.body);
    if (!ctx.categories.has(input.category)) throw badRequest('Unknown category');
    const venue = defaultVenueId(ctx.db);
    if (!venue) throw badRequest('Venue not configured');
    const id = insertReport(ctx.db, venue, input);
    runMatchingForReport(ctx, id);
    return { id };
  });

  app.get('/reports', async (req) => listReports(ctx.db, requireStaff(ctx, req).venueId));
};
export default routes;
