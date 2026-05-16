import { Injectable, signal } from '@angular/core';
import { Lead } from '../types/lead.model';

/** Provides mock lead data for UI development.
 *  Replace with real HTTP calls once the backend is ready. */
@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly MOCK_LEADS: Lead[] = [
    {
      id: '1', firstName: 'Christopher', lastName: 'Maclead',
      company: 'Rangoni Of Florence', email: 'christopher-maclead@noemail.invalid',
      phone: '555-555-5556', source: 'Cold Call', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-15'
    },
    {
      id: '2', firstName: 'Carissa', lastName: 'Kidman',
      company: 'Oh My Goodknits Inc', email: 'carissa-kidman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-18'
    },
    {
      id: '3', firstName: 'James', lastName: 'Merced',
      company: 'Kwik Kopy Printing', email: 'james-merced@noemail.invalid',
      phone: '555-555-5555', source: 'Web Download', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-01'
    },
    {
      id: '4', firstName: 'Tresa', lastName: 'Sweely',
      company: 'Morlong Associates', email: 'tresa-sweely@noemail.invalid',
      phone: '555-555-5555', source: 'Seminar Partner', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-05'
    },
    {
      id: '5', firstName: 'Felix', lastName: 'Hirpara',
      company: 'Chapman', email: 'felix-hirpara@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'lost', createdAt: '2026-04-10'
    },
    {
      id: '6', firstName: 'Kayleigh', lastName: 'Lace',
      company: 'Buckley Miller & Wright', email: 'kayleigh-lace@noemail.invalid',
      phone: '555-555-5555', source: 'Partner', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-04-12'
    },
    {
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },{
      id: '7', firstName: 'Yvonne', lastName: 'Tjepkema',
      company: 'Grayson', email: 'yvonne-tjepkema@noemail.invalid',
      phone: '555-555-5555', source: 'External Referral', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-04-14'
    },
    {
      id: '8', firstName: 'Michael', lastName: 'Ruta',
      company: 'Buckley Miller & Wright', email: 'michael-gruta@noemail.invalid',
      phone: '555-555-5555', source: 'Online Store', owner: 'Ali Yara',
      status: 'contacted', createdAt: '2026-03-25'
    },
    {
      id: '9', firstName: 'Theola', lastName: 'Frey',
      company: 'Dal Tile Corporation', email: 'theola-frey@noemail.invalid',
      phone: '555-555-5555', source: 'Cold Call', owner: 'Ali Yara',
      status: 'qualified', createdAt: '2026-04-18'
    },
    {
      id: '10', firstName: 'Chau', lastName: 'Kitzman',
      company: 'Creative Business Systems', email: 'chau-kitzman@noemail.invalid',
      phone: '555-555-5555', source: 'Advertisement', owner: 'Ali Yara',
      status: 'new', createdAt: '2026-03-22'
    },
  ];

  readonly leads = signal<Lead[]>(this.MOCK_LEADS);
  readonly totalCount = signal<number>(this.MOCK_LEADS.length);
}
