export default [
    {
        image:
            'https://images.unsplash.com/photo-1561623002-b3520705eccf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
        title: 'We need power.',
        distance: '4 miles away',
        text: 'Lorem ipsum COALar sit amet consectetur, adipisicing elit.',
        weight: 1,
        isAvailableWhen: [
            { state: { environment: [10, 100], money: [80, 100] } },
            { state: { people: [10, 100], money: [80, 100] } },
            { state: { security: [10, 100], money: [80, 100] } }
        ],
        actions: {
            left: {
                modifier: {
                    environment: -100,
                    people: -100,
                    security: -100,
                    money: -100
                }
            },
            right: {
                modifier: {
                    environment: 40,
                    people: 60,
                    security: 75,
                    money: 90
                }
            }
        }
    },
    {
        image:
            'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60',
        title: 'Invest in solar?',
        distance: '100 miles away',
        text: 'Lorem ipsum SOLAR sit amet consectetur, adipisicing elit.',
        weight: 1,
        isAvailableWhen: [
            { state: { environment: [60, 100], money: [30, 31] } },
            { state: { people: [60, 100], money: [30, 31] } },
            { state: { security: [60, 100], money: [30, 31] } }
        ],
        actions: {
            left: {
                modifier: {
                    environment: -100,
                    people: -100,
                    security: -100,
                    money: -100
                }
            },
            right: {
                modifier: {
                    environment: 40,
                    people: 60,
                    security: 75,
                    money: 90
                }
            }
        }
    }
]
