import { log } from './index.js';

let obj = {};

obj = {
    headerCount: 1,
    savedJobs: [
        {
            id: '111',
            listingGlobalId: '4d0b54b3-1111-4de2-1111-09d0ded71397',
            title: 'Electronics Test Engineer',
            companyName: 'Eskan Electronics Ltd',
            companyUrl: '/jobs-at/eskan-electronics/jobs',
            companyId: 222,
            location: 'UB6',
            salary: 'From £25,000 to £35,000 per annum Depending on experience',
            datePosted: '2022-12-30T12:50:56.743Z',
            dateExpire: '2023-01-02T14:24:18.027Z',
            relatedjobs: [1, 2, 232, 1, true, false, 'first', { none: { [null]: 'test' } }],
            companyLogo: '',
            companyLogoAlt: 'Eskan Electronics Ltd',
            specialString: 'single` quote {{ } [[ ]]]"\n" \'',
            applyUrl: '/job/11135371/apply',
            url: 'https://www.example.com/job/electronics-test-engineer/eskan-electronics-ltd-job111',
            isActive: true,
            external: false,
        },
    ],
};
obj['hasJson'] = JSON.stringify(obj);
obj['hasMoreJson'] = JSON.stringify(obj);
obj['hasEvenMoreJson'] = JSON.stringify(obj);
console.log('console.log(object)');
console.log(obj);
gap();
console.log('log(object)');
log(obj);
gap();
console.log('console.log(JSON.stringify(object))');
console.log(JSON.stringify(obj));
gap();
console.log('log(JSON.stringify(object))');
log(JSON.stringify(obj));

function gap() {
    console.log();
    console.log();
    console.log();
}
