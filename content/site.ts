/**
 * ─────────────────────────────────────────────────────────────────
 *  CHIPMUNKS SITE CONTENT
 *  Everything a non-developer might want to change lives here:
 *  copy, prices, contact details, activities, FAQs.
 *  Session dates are managed in the Admin area, not here.
 * ─────────────────────────────────────────────────────────────────
 */

export const site = {
  clubName: 'The Chipmunks',
  orgName: 'PossAbilities',
  strapline: 'School holiday adventures at PossAbilities',
  intro:
    'The Chipmunks is our school holiday club where children come to the PossAbilities hub in Heywood for big days out without going anywhere at all — feeding and caring for the animals on our farm, exploring the immersive sensory room, and joining in games, crafts and activities led by our friendly Activity Champions.',

  // Contact + venue — update when confirmed
  venue: {
    name: 'PossAbilities Hub',
    addressLines: ['Heywood', 'Greater Manchester'],
    postcode: '',
  },
  contact: {
    email: 'digital@possabilities.org.uk',
    phone: '01706 000 000', // TODO: replace with the Chipmunks phone line
    website: 'https://www.possabilities.org.uk',
  },

  session: {
    startTime: '9:30am',
    endTime: '3:30pm',
    dropOffFrom: '9:15am',
    pricePerDay: 25, // £ per child per day — TODO: confirm
    ageRange: '5–13',
  },

  activities: [
    {
      emoji: '🐐',
      title: 'Down on the farm',
      blurb:
        'Meet, feed and help care for our animals. Mucking in is all part of the fun — wellies at the ready!',
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
      emoji: '🎨',
      title: 'Arts & crafts',
      blurb:
        'Get gloriously messy with painting, model-making and seasonal crafts to take home and show off.',
      color: 'acorn',
    },
    {
      emoji: '🏃',
      title: 'Games galore',
      blurb:
        'Team games, treasure hunts, parachute games and sports — indoors and out, whatever the weather.',
      color: 'brand',
    },
    {
      emoji: '🌱',
      title: 'Growing & nature',
      blurb:
        'Plant, dig and discover in our growing spaces, and learn where our food really comes from.',
      color: 'leaf',
    },
    {
      emoji: '🧁',
      title: 'Snacks & baking',
      blurb:
        'Little chefs welcome! We bake, decorate and (most importantly) taste our own creations.',
      color: 'sunshine',
    },
  ],

  typicalDay: [
    { time: '9:15am', title: 'Doors open', detail: 'Drop off, settle in and say hello to the team.' },
    { time: '9:45am', title: 'Morning circle', detail: 'We plan our day together and warm up with a game.' },
    { time: '10:15am', title: 'Farm time', detail: 'Feeding rounds and animal care in small groups.' },
    { time: '12:00pm', title: 'Lunch', detail: 'Packed lunches together — picnic outside when it’s sunny.' },
    { time: '1:00pm', title: 'Immersive room & crafts', detail: 'Groups rotate between the immersive room and craft tables.' },
    { time: '2:30pm', title: 'Big game finale', detail: 'Everyone together for the afternoon’s big game.' },
    { time: '3:30pm', title: 'Home time', detail: 'Pick up, plus a rundown of what we got up to.' },
  ],

  faqs: [
    {
      q: 'What ages is Chipmunks for?',
      a: 'Chipmunks welcomes children aged 5–13. Sessions are staffed by our trained Activity Champions, and we support children of all abilities — tell us what your child needs on the booking form and we will make it work.',
    },
    {
      q: 'What should my child bring?',
      a: 'A packed lunch, a water bottle, clothes that can get muddy, and wellies or sturdy shoes for the farm. We provide everything else, including snacks and all activity equipment.',
    },
    {
      q: 'How do drop-off and pick-up work?',
      a: 'Doors open from 9:15am and sessions finish at 3:30pm. An Activity Champion checks every child in on arrival and out at pick-up, and we will only release children to the adults you name on the booking form.',
    },
    {
      q: 'My child has a medical condition or allergy — can they come?',
      a: 'Almost always, yes. The booking form asks about medical conditions, allergies and medication so our team is fully prepared. If you would like to talk it through first, give us a call — we are very happy to help.',
    },
    {
      q: 'How do I pay?',
      a: 'Once you book you will receive a confirmation email with payment details. We will confirm your child’s place as soon as payment arrives.',
    },
    {
      q: 'What if I need to cancel?',
      a: 'Plans change — just reply to your confirmation email or call us and we will cancel or move your booking. We ask for 48 hours’ notice where possible so we can offer the place to another family.',
    },
  ],

  whatToBring: ['Packed lunch & water bottle', 'Clothes that can get muddy', 'Wellies or sturdy shoes', 'Sun cream & a hat (fingers crossed!)', 'A waterproof coat (just in case)'],
};

export type Site = typeof site;
