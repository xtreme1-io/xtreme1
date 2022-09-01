<!--
 Access control component for fine-grained access control.
-->
<script lang="tsx">
  import type { PropType } from 'vue';
  import { defineComponent } from 'vue';
  import { RoleEnum } from '/@/enums/roleEnum';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { getSlot } from '/@/utils/helper/tsxHelper';

  export default defineComponent({
    name: 'Authority',
    props: {
      /**
       * Specified role is visible
       * When the permission mode is the role mode, the value value can pass the role value.
       * When the permission mode is background, the value value can pass the code permission value
       * @default ''
       */
      value: {
        type: [Number, Array, String] as PropType<RoleEnum | RoleEnum[] | string | string[]>,
        default: '',
      },
    },
    setup(props, { slots }) {
      const { hasPermission } = usePermission();
      const { createMessage } = useMessage();
      const handleToast = () => {
        createMessage.error("You don't have permission, please contact admin");
      };
      /**
       * Render role button
       */
      function renderAuth() {
        const { value } = props;
        if (!value) {
          return getSlot(slots);
        }

        return hasPermission(value) ? (
          getSlot(slots)
        ) : (
          <div onClick={handleToast}>
            <div style="pointer-events:none;cursor:not-allowed">{getSlot(slots)}</div>
          </div>
        );
      }

      return () => {
        // Role-based value control
        return renderAuth();
      };
    },
  });
</script>
