/**
 * ─────────────────────────────────────────────────────────────────
 *  CHERWELL CHIPMUNKS SITE CONTENT
 *  Everything a non-developer might want to change lives here:
 *  copy, prices, contact details, activities, FAQs.
 *  Camp dates are managed in the Admin area, not here.
 * ─────────────────────────────────────────────────────────────────
 */

export const site = {
  clubName: 'Cherwell Chipmunks',
  orgName: 'PossAbilities',
  strapline: 'School holidays… don’t panic!',
  tagline: 'Live The Life You Choose',
  intro:
    'Bring your children or grandchildren to the Cherwell Chipmunks Day Camp for a full day of fun activities and tasks out in the open air — helping look after our animals, exploring the immersive room, treasure hunts, the famous Chipmunks bake-off, games, competitions and much more.',

  // Who can come — the camp is a staff perk
  eligibility:
    'Cherwell Chipmunks must be children or grandchildren of PossAbilities employees, and 8 years old or over.',

  // Contact + venue (from the PossAbilities brand manual)
  venue: {
    name: 'The Cherwell Centre',
    addressLines: ['Cherwell Avenue', 'Heywood'],
    postcode: 'OL10 4SY',
  },
  contact: {
    email: 'digital@possabilities.org.uk',
    phone: '01706 982 181',
    website: 'https://www.possabilities.org.uk',
  },

  session: {
    startTime: '8:30am',
    endTime: '4:00pm',
    dropOffFrom: '8:30am',
    pricePerDay: 15, // £ per child per day — includes lunch
    priceIncludes: 'lunch included',
    ageRange: '8+',
  },

  /**
   * Ways to pay — listed in the branded payment email the admin team
   * sends from the Admin area. Replace with the real details before
   * going live (these are placeholders).
   */
  paymentMethods: [
    {
      title: 'Bank transfer',
      detail:
        'Account name: PossAbilities CIC · Sort code: 00-00-00 · Account number: 00000000. Use your booking reference as the payment reference.',
    },
    {
      title: 'Cash or card at the Cherwell Centre',
      detail: 'Pop in and pay at reception — just quote your booking reference.',
    },
    {
      title: 'Payroll deduction',
      detail: 'PossAbilities employees can ask for the cost to be deducted from their next pay. Contact HR to arrange.',
    },
  ],

  // The deal — shown on the site and echoed in emails
  theDeal: [
    'Chipmunks have to be 8 years old or over',
    '£15 per day — lunch included',
    'For children & grandchildren of PossAbilities employees',
    'Drop off 8:30am · pick up 4:00pm',
    'Places are limited — first come, first served',
    'Payment in advance · no refunds for cancellations',
  ],

  activities: [
    {
      emoji: '🐐',
      title: 'Help look after our animals',
      blurb:
        'Feeding rounds, grooming and mucking in — our animals love Chipmunks, and the jobs are real. Wellies at the ready!',
      color: 'leaf',
    },
    {
      emoji: '✨',
      title: 'The immersive room',
      blurb:
        'Step into another world in our immersive sensory room — under the sea one minute, outer space the next.',
      color: 'sky',
    },
    {
      emoji: '🗺️',
      title: 'Treasure hunts',
      blurb:
        'Clues, maps and mysteries all over the Cherwell Centre — bring your best detective brain.',
      color: 'acorn',
    },
    {
      emoji: '🧁',
      title: 'Chipmunks bake-off',
      blurb:
        'Ready, set… BAKE! Our famous bake-off crowns a star baker every camp. Judging is delicious.',
      color: 'sunshine',
    },
    {
      emoji: '🏆',
      title: 'Games & competitions',
      blurb:
        'Team games, sports and daft challenges out in the open air — with proper bragging rights at stake.',
      color: 'brand',
    },
    {
      emoji: '🎨',
      title: 'Arts & craft',
      blurb:
        'Get gloriously messy with painting, model-making and crafts to take home and show off.',
      color: 'leaf',
    },
  ],

  typicalDay: [
    { time: '8:30am', title: 'Doors open', detail: 'Drop off, settle in and say hello to the team.' },
    { time: '9:00am', title: 'Morning circle', detail: 'We plan our day together and warm up with a game.' },
    { time: '9:30am', title: 'Animal jobs', detail: 'Feeding rounds and animal care in small groups.' },
    { time: '12:00pm', title: 'Lunch — on us!', detail: 'A proper lunch for every Chipmunk, included in the day.' },
    { time: '1:00pm', title: 'Immersive room & crafts', detail: 'Groups rotate between the immersive room and craft tables.' },
    { time: '2:30pm', title: 'Big game finale', detail: 'Everyone together for the afternoon’s big game or competition.' },
    { time: '4:00pm', title: 'Home time', detail: 'Pick up, plus a rundown of what we got up to.' },
  ],

  // Placeholder quotes — swap for real family feedback when you have it
  testimonials: [
    {
      quote: 'He talks about the animals for days afterwards. Chipmunks is the first club he actually asks to go back to.',
      name: 'Parent of a 9-year-old Chipmunk',
    },
    {
      quote: 'The team knew about her allergies before we even reminded them. We felt completely at ease all day.',
      name: 'Mum of a first-time Chipmunk',
    },
    {
      quote: 'The immersive room blew his mind — he told everyone he went to space during the holidays!',
      name: 'Grandad of a 10-year-old Chipmunk',
    },
  ],

  faqs: [
    {
      q: 'Who can come to Cherwell Chipmunks?',
      a: 'The day camp is a PossAbilities staff perk: Chipmunks must be children or grandchildren of PossAbilities employees, and must be 8 years old or over. Places are limited and allocated on a first come, first served basis.',
    },
    {
      q: 'How much does it cost, and is lunch included?',
      a: 'It’s £15 per child per day, and yes — lunch is included, along with all activities and snacks. Payment is in advance, and we can’t offer refunds for cancellations.',
    },
    {
      q: 'What are the times?',
      a: 'Drop off from 8:30am and pick up at 4:00pm. An Activity Champion checks every child in on arrival and out at pick-up, and we will only release children to the adults you name on the booking form.',
    },
    {
      q: 'What should my child bring?',
      a: 'A water bottle, clothes that can get muddy, and wellies or sturdy shoes for the animals. Lunch is provided. If they’re coming on the water fight day, pack spare clothes and a towel!',
    },
    {
      q: 'My child has a medical condition or allergy — can they come?',
      a: 'Almost always, yes. The booking form asks about medical conditions, allergies and medication so our team is fully prepared. If you would like to talk it through first, give us a call — we are very happy to help.',
    },
    {
      q: 'What if I need to cancel?',
      a: 'Please let us know as soon as you can so we can offer the place to another family — but do note that payment is in advance and we’re unable to offer refunds for cancellations.',
    },
  ],

  whatToBring: [
    'A water bottle',
    'Clothes that can get muddy',
    'Wellies or sturdy shoes',
    'Sun cream & a hat (fingers crossed!)',
    'Spare clothes on water-fight day 💦',
  ],
};

export type Site = typeof site;
