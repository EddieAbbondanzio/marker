import { actions } from '@/modules/app/store/modules/editor/actions';

describe('Editor actions', () => {
    describe('tabSwitch', () => {
        it('sets active, and reset old tab.', async () => {
            await expectAction(
                actions.tabSwitch,
                null,
                {
                    state: {
                        tabs: {
                            values: []
                        }
                    }
                },
                ['SWITCH_TAB']
            );
        });
    });
});
