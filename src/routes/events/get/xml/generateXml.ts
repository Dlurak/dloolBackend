import { eventsCollection } from '../../../../database/events/event';

export const generateXml = async () => {
    const events = await eventsCollection.find({}).toArray();

    const xmlItems = events.map(
        (e) =>
            `<event id="${e._id}">
            <title>${e.title}</title>
            <description>${e.description}</description>
            <date>
                <year>${e.date.year}</year>
                <month>${e.date.month}</month>
                <day>${e.date.day}</day>
                <hour>${e.date.hour}</hour>
                <minute>${e.date.minute}</minute>
            </date>
            <duration>${e.duration}</duration>
            <location>${e.location}</location>
            <subject>${e.subject}</subject>
            <class>${e.class}</class>
            <editors>${e.editors.join(',')}</editors>
            <editedAt>${e.editedAt.join(',')}</editedAt>
        </event>`,
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
    <events>
        ${xmlItems.join('\n')}
    </events>`;
};
