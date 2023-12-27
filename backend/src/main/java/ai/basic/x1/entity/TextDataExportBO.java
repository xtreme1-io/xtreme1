package ai.basic.x1.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextDataExportBO extends DataExportBaseBO {

    private List<ExportDataTextFileBO> texts;
}
